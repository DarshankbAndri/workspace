package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceSpareUsageDAO;
import com.example.cmmsApplication.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.entity.MaintenanceAssignment;
import com.example.cmmsApplication.entity.MaintenanceSpareUsage;
import com.example.cmmsApplication.entity.SparePartSiteStock;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceSpareUsageService {
    private final MaintenanceSpareUsageDAO usageDAO;
    private final MaintenanceAssignmentService assignmentService;
    private final SparePartService sparePartService;
    private final AccessControlService accessControlService;

    public MaintenanceSpareUsageService(MaintenanceSpareUsageDAO usageDAO,
                                        MaintenanceAssignmentService assignmentService,
                                        SparePartService sparePartService,
                                        AccessControlService accessControlService) {
        this.usageDAO = usageDAO;
        this.assignmentService = assignmentService;
        this.sparePartService = sparePartService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceSpareUsageDTO> getByAssignment(Long assignmentId) {
        accessControlService.validatePermission("SPARE_USAGE_VIEW");
        MaintenanceAssignment assignment = assignmentService.getEntity(assignmentId);
        validateAssignmentAccess(assignment);
        return usageDAO.findByAssignmentId(assignmentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MaintenanceSpareUsageDTO create(Long assignmentId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_CREATE");
        MaintenanceAssignment assignment = assignmentService.getEntity(assignmentId);
        validateAssignmentAccess(assignment);
        if (usageDAO.existsByAssignmentIdAndStockId(assignmentId, dto.getStockId())) {
            throw new InvalidOperationException("This spare part is already attached to the assignment. Edit the existing usage quantity.");
        }
        SparePartSiteStock stock = sparePartService.getStockEntity(dto.getStockId());
        validateSameSite(assignment, stock);
        SparePartSiteStock updatedStock = sparePartService.consumeStock(stock.getId(), dto.getQuantityUsed(), assignmentId, dto.getRemarks());

        MaintenanceSpareUsage usage = new MaintenanceSpareUsage();
        usage.setAssignment(assignment);
        usage.setStock(updatedStock);
        usage.setSparePart(updatedStock.getSparePart());
        usage.setQuantityUsed(dto.getQuantityUsed());
        usage.setUnitCost(updatedStock.getUnitCost());
        usage.setTotalCost(total(dto.getQuantityUsed(), updatedStock.getUnitCost()));
        usage.setRemarks(dto.getRemarks());
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO update(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_UPDATE");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        BigDecimal oldQuantity = usage.getQuantityUsed();
        BigDecimal newQuantity = positive(dto.getQuantityUsed());
        BigDecimal difference = newQuantity.subtract(oldQuantity);
        if (difference.compareTo(BigDecimal.ZERO) > 0) {
            sparePartService.consumeStock(usage.getStock().getId(), difference, assignmentId, dto.getRemarks());
        } else if (difference.compareTo(BigDecimal.ZERO) < 0) {
            sparePartService.returnStock(usage.getStock().getId(), difference.abs(), assignmentId, "Usage quantity reduced");
        }
        SparePartSiteStock stock = sparePartService.getStockEntity(usage.getStock().getId());
        usage.setQuantityUsed(newQuantity);
        usage.setUnitCost(stock.getUnitCost());
        usage.setTotalCost(total(newQuantity, stock.getUnitCost()));
        usage.setRemarks(dto.getRemarks());
        return toDTO(usageDAO.save(usage));
    }

    public void delete(Long assignmentId, Long usageId) {
        accessControlService.validatePermission("SPARE_USAGE_DELETE");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        sparePartService.returnStock(usage.getStock().getId(), usage.getQuantityUsed(), assignmentId, "Spare usage removed");
        usageDAO.delete(usage);
    }

    @Transactional(readOnly = true)
    public BigDecimal getMaterialCost(Long assignmentId) {
        return usageDAO.findByAssignmentId(assignmentId).stream()
                .map(MaintenanceSpareUsage::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private MaintenanceSpareUsage getUsage(Long assignmentId, Long usageId) {
        return usageDAO.findByIdAndAssignmentId(usageId, assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare usage not found with id: " + usageId));
    }

    private void validateAssignmentAccess(MaintenanceAssignment assignment) {
        accessControlService.validateSiteAccess(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId());
    }

    private void validateSameSite(MaintenanceAssignment assignment, SparePartSiteStock stock) {
        Long assignmentSiteId = assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId();
        if (assignmentSiteId == null || !assignmentSiteId.equals(stock.getSite().getId())) {
            throw new InvalidOperationException("Spare part stock site must match assignment site");
        }
    }

    private BigDecimal positive(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Quantity used must be greater than zero");
        }
        return value;
    }

    private BigDecimal total(BigDecimal quantity, BigDecimal unitCost) {
        return quantity.multiply(unitCost == null ? BigDecimal.ZERO : unitCost).setScale(2, RoundingMode.HALF_UP);
    }

    private MaintenanceSpareUsageDTO toDTO(MaintenanceSpareUsage usage) {
        SparePartSiteStock stock = usage.getStock();
        MaintenanceSpareUsageDTO dto = new MaintenanceSpareUsageDTO();
        dto.setId(usage.getId());
        dto.setAssignmentId(usage.getAssignment().getId());
        dto.setStockId(stock.getId());
        dto.setSparePartId(usage.getSparePart().getId());
        dto.setPartCode(usage.getSparePart().getPartCode());
        dto.setPartName(usage.getSparePart().getPartName());
        dto.setUnit(usage.getSparePart().getUnit());
        dto.setSiteId(stock.getSite().getId());
        dto.setSiteName(stock.getSite().getSiteName());
        dto.setAvailableStock(stock.getCurrentStock());
        dto.setQuantityUsed(usage.getQuantityUsed());
        dto.setUnitCost(usage.getUnitCost());
        dto.setTotalCost(usage.getTotalCost());
        dto.setRemarks(usage.getRemarks());
        dto.setCreatedAt(usage.getCreatedAt());
        dto.setUpdatedAt(usage.getUpdatedAt());
        return dto;
    }
}
