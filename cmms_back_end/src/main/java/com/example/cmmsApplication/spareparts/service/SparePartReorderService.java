package com.example.cmmsApplication.spareparts.service;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.service.VendorService;
import com.example.cmmsApplication.spareparts.dao.SparePartReorderDAO;
import com.example.cmmsApplication.spareparts.dao.MaintenanceSpareUsageDAO;
import com.example.cmmsApplication.spareparts.dto.SparePartReorderDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.spareparts.entity.MaintenanceSpareUsage;
import com.example.cmmsApplication.spareparts.entity.SparePartReorderRequest;
import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SparePartReorderService {
    private final SparePartReorderDAO reorderDAO;
    private final MaintenanceSpareUsageDAO usageDAO;
    private final SparePartService sparePartService;
    private final VendorService vendorService;
    private final AccessControlService accessControlService;

public SparePartReorderDTO create(SparePartReorderDTO dto) {
        SparePartSiteStock stock = sparePartService.getStockEntity(dto.getStockId());
        accessControlService.validateSiteAccess(stock.getSite().getId());

        BigDecimal quantity = positive(dto.getRequestedQuantity());
        BigDecimal unitCost = nonNegative(dto.getEstimatedUnitCost() == null ? stock.getUnitCost() : dto.getEstimatedUnitCost());

        SparePartReorderRequest request = new SparePartReorderRequest();
        request.setStock(stock);
        request.setSparePart(stock.getSparePart());
        request.setSite(stock.getSite());
        request.setVendor(resolveVendor(dto.getVendorId(), stock));
        request.setRequestedQuantity(quantity);
        request.setEstimatedUnitCost(unitCost);
        request.setEstimatedTotalCost(quantity.multiply(unitCost).setScale(2, RoundingMode.HALF_UP));
        request.setStatus(defaultStatus(dto.getStatus(), "REQUESTED"));
        request.setExpectedDate(dto.getExpectedDate());
        request.setRemarks(dto.getRemarks());
        request.setRequestedBy(accessControlService.getCurrentUser());
        return toDTO(reorderDAO.save(request));
    }

    public SparePartReorderDTO update(Long id, SparePartReorderDTO dto) {
        SparePartReorderRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite().getId());

        BigDecimal quantity = positive(dto.getRequestedQuantity() == null ? request.getRequestedQuantity() : dto.getRequestedQuantity());
        BigDecimal unitCost = nonNegative(dto.getEstimatedUnitCost() == null ? request.getEstimatedUnitCost() : dto.getEstimatedUnitCost());
        request.setVendor(resolveVendor(dto.getVendorId(), request.getStock()));
        request.setRequestedQuantity(quantity);
        request.setEstimatedUnitCost(unitCost);
        request.setEstimatedTotalCost(quantity.multiply(unitCost).setScale(2, RoundingMode.HALF_UP));
        request.setStatus(defaultStatus(dto.getStatus(), request.getStatus()));
        request.setExpectedDate(dto.getExpectedDate());
        request.setRemarks(dto.getRemarks());
        return toDTO(reorderDAO.save(request));
    }

    @Transactional(readOnly = true)
    public List<SparePartReorderDTO> getAll(Long siteId, String status) {
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase(Locale.ROOT);
        List<SparePartReorderRequest> requests;
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
            requests = normalizedStatus == null
                    ? reorderDAO.findBySiteIds(List.of(siteId))
                    : reorderDAO.findBySiteIdAndStatus(siteId, normalizedStatus);
        } else if (accessControlService.isAdmin()) {
            requests = normalizedStatus == null
                    ? reorderDAO.findAll()
                    : reorderDAO.findBySiteIdsAndStatus(accessControlService.getAllowedSiteIds(), normalizedStatus);
        } else {
            List<Long> siteIds = accessControlService.getAllowedSiteIds();
            requests = normalizedStatus == null
                    ? reorderDAO.findBySiteIds(siteIds)
                    : reorderDAO.findBySiteIdsAndStatus(siteIds, normalizedStatus);
        }
        return requests.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public SparePartReorderDTO receiveStock(Long id, SparePartTransactionDTO dto) {
        SparePartReorderRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite().getId());
        BigDecimal quantity = positive(dto == null || dto.getQuantity() == null ? request.getRequestedQuantity() : dto.getQuantity());

        SparePartTransactionDTO transaction = new SparePartTransactionDTO();
        transaction.setQuantity(quantity);
        transaction.setUnitCost(dto == null || dto.getUnitCost() == null ? request.getEstimatedUnitCost() : dto.getUnitCost());
        transaction.setReferenceType("PURCHASE_REQUEST");
        transaction.setReferenceId(request.getId());
        transaction.setRemarks(dto == null || dto.getRemarks() == null || dto.getRemarks().isBlank() ? "Purchase stock received" : dto.getRemarks());
        sparePartService.stockIn(request.getStock().getId(), transaction);

        request.setStatus("RECEIVED");
        SparePartReorderRequest saved = reorderDAO.save(request);
        if (saved.getSpareRequest() != null) {
            MaintenanceSpareUsage usage = saved.getSpareRequest();
            usage.setStatus("PURCHASE_RECEIVED");
            usageDAO.save(usage);
        }
        return toDTO(saved);
    }

    private SparePartReorderRequest getEntity(Long id) {
        return reorderDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reorder request not found with id: " + id));
    }

    private Vendor resolveVendor(Long vendorId, SparePartSiteStock stock) {
        Long effectiveVendorId = vendorId == null && stock.getSparePart().getPreferredVendor() != null
                ? stock.getSparePart().getPreferredVendor().getId()
                : vendorId;
        if (effectiveVendorId == null) {
            return null;
        }
        Vendor vendor = vendorService.getEntity(effectiveVendorId);
        if (!vendorService.isVendorAssignedToSite(vendor.getId(), stock.getSite().getId())) {
            throw new InvalidOperationException("Selected vendor is not assigned to the stock site.");
        }
        return vendor;
    }

    private BigDecimal positive(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Requested quantity must be greater than zero");
        }
        return value;
    }

    private BigDecimal nonNegative(BigDecimal value) {
        BigDecimal number = value == null ? BigDecimal.ZERO : value;
        if (number.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Estimated unit cost cannot be negative");
        }
        return number;
    }

    private String defaultStatus(String status, String fallback) {
        return status == null || status.isBlank() ? fallback : status.trim().toUpperCase(Locale.ROOT);
    }

    private SparePartReorderDTO toDTO(SparePartReorderRequest request) {
        SparePartReorderDTO dto = new SparePartReorderDTO();
        dto.setId(request.getId());
        dto.setStockId(request.getStock().getId());
        dto.setSparePartId(request.getSparePart().getId());
        dto.setPartCode(request.getSparePart().getPartCode());
        dto.setPartName(request.getSparePart().getPartName());
        dto.setSiteId(request.getSite().getId());
        dto.setSiteName(request.getSite().getSiteName());
        dto.setAssignmentId(request.getAssignment() == null ? null : request.getAssignment().getId());
        dto.setSpareRequestId(request.getSpareRequest() == null ? null : request.getSpareRequest().getId());
        dto.setVendorId(request.getVendor() == null ? null : request.getVendor().getId());
        dto.setVendorName(request.getVendor() == null ? null : request.getVendor().getVendorName());
        dto.setRequestedQuantity(request.getRequestedQuantity());
        dto.setEstimatedUnitCost(request.getEstimatedUnitCost());
        dto.setEstimatedTotalCost(request.getEstimatedTotalCost());
        dto.setStatus(request.getStatus());
        dto.setExpectedDate(request.getExpectedDate());
        dto.setRemarks(request.getRemarks());
        dto.setRequestedBy(request.getRequestedBy() == null ? null : request.getRequestedBy().getId());
        dto.setRequestedByName(request.getRequestedBy() == null ? null : request.getRequestedBy().getUsername());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
