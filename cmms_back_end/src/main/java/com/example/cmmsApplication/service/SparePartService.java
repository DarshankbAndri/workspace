package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.SparePartDAO;
import com.example.cmmsApplication.dao.SparePartSiteStockDAO;
import com.example.cmmsApplication.dao.SparePartTransactionDAO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.dto.SparePartDTO;
import com.example.cmmsApplication.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.entity.SparePart;
import com.example.cmmsApplication.entity.SparePartSiteStock;
import com.example.cmmsApplication.entity.SparePartTransaction;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.entity.Vendor;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class SparePartService {
    private final SparePartDAO sparePartDAO;
    private final SparePartSiteStockDAO stockDAO;
    private final SparePartTransactionDAO transactionDAO;
    private final SiteService siteService;
    private final VendorService vendorService;
    private final AccessControlService accessControlService;
    private final ListSearchService listSearchService;
    private final NotificationService notificationService;

    public SparePartService(SparePartDAO sparePartDAO,
                            SparePartSiteStockDAO stockDAO,
                            SparePartTransactionDAO transactionDAO,
                            SiteService siteService,
                            VendorService vendorService,
                            AccessControlService accessControlService,
                            ListSearchService listSearchService,
                            NotificationService notificationService) {
        this.sparePartDAO = sparePartDAO;
        this.stockDAO = stockDAO;
        this.transactionDAO = transactionDAO;
        this.siteService = siteService;
        this.vendorService = vendorService;
        this.accessControlService = accessControlService;
        this.listSearchService = listSearchService;
        this.notificationService = notificationService;
    }

    public SparePartDTO create(SparePartDTO dto) {
        accessControlService.validatePermission("SPARE_PART_CREATE");
        validateRequired(dto);
        accessControlService.validateSiteAccess(dto.getSiteId());
        String partCode = normalizeCode(dto.getPartCode());
        if (sparePartDAO.existsByPartCode(partCode)) {
            throw new InvalidOperationException("Part code already exists: " + partCode);
        }

        SparePart part = new SparePart();
        applyPart(part, dto);
        SparePart savedPart = sparePartDAO.save(part);

        SparePartSiteStock stock = new SparePartSiteStock();
        stock.setSparePart(savedPart);
        applyStock(stock, dto);
        SparePartSiteStock savedStock = stockDAO.save(stock);

        BigDecimal openingStock = nonNegative(dto.getCurrentStock(), "Current stock");
        if (openingStock.compareTo(BigDecimal.ZERO) > 0) {
            createTransaction(savedStock, "OPENING_BALANCE", openingStock, savedStock.getUnitCost(), BigDecimal.ZERO,
                    openingStock, "SPARE_PART", savedPart.getId(), "Opening balance");
        }
        notifyIfLowStock(savedStock);
        return toDTO(savedStock);
    }

    public SparePartDTO update(Long stockId, SparePartDTO dto) {
        accessControlService.validatePermission("SPARE_PART_UPDATE");
        SparePartSiteStock stock = getStockEntity(stockId);
        accessControlService.validateSiteAccess(stock.getSite().getId());
        if (dto.getSiteId() != null && !stock.getSite().getId().equals(dto.getSiteId())) {
            throw new InvalidOperationException("Stock site cannot be changed. Create a new site stock entry instead.");
        }
        String partCode = normalizeCode(dto.getPartCode());
        if (sparePartDAO.existsByPartCodeAndIdNot(partCode, stock.getSparePart().getId())) {
            throw new InvalidOperationException("Part code already exists: " + partCode);
        }
        applyPart(stock.getSparePart(), dto);
        stock.setMinimumStock(nonNegative(dto.getMinimumStock(), "Minimum stock"));
        stock.setUnitCost(nonNegative(dto.getUnitCost(), "Unit cost"));
        stock.setStorageLocation(dto.getStorageLocation());
        stock.setStatus(defaultStatus(dto.getStatus()));
        SparePartSiteStock saved = stockDAO.save(stock);
        notifyIfLowStock(saved);
        return toDTO(saved);
    }

    public void delete(Long stockId) {
        accessControlService.validatePermission("SPARE_PART_DELETE");
        SparePartSiteStock stock = getStockEntity(stockId);
        accessControlService.validateSiteAccess(stock.getSite().getId());
        stock.setStatus("INACTIVE");
        stockDAO.save(stock);
    }

    @Transactional(readOnly = true)
    public SparePartDTO getByStockId(Long stockId) {
        accessControlService.validatePermission("SPARE_PART_VIEW");
        SparePartSiteStock stock = getStockEntity(stockId);
        accessControlService.validateSiteAccess(stock.getSite().getId());
        return toDTO(stock);
    }

    @Transactional(readOnly = true)
    public PageProperties search(SearchDTO searchDTO) {
        return listSearchService.searchSparePartStocks(searchDTO);
    }

    @Transactional(readOnly = true)
    public List<SparePartDTO> getActiveBySite(Long siteId) {
        accessControlService.validatePermission("SPARE_PART_VIEW");
        accessControlService.validateSiteAccess(siteId);
        return stockDAO.findBySiteIdAndStatus(siteId, "ACTIVE").stream()
                .filter((stock) -> "ACTIVE".equalsIgnoreCase(stock.getSparePart().getStatus()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SparePartTransactionDTO stockIn(Long stockId, SparePartTransactionDTO dto) {
        accessControlService.validatePermission("STOCK_TRANSACTION_CREATE");
        SparePartSiteStock stock = getStockForUpdate(stockId);
        accessControlService.validateSiteAccess(stock.getSite().getId());
        BigDecimal quantity = positive(dto.getQuantity(), "Quantity");
        BigDecimal unitCost = nonNegative(dto.getUnitCost() == null ? stock.getUnitCost() : dto.getUnitCost(), "Unit cost");
        BigDecimal before = stock.getCurrentStock();
        BigDecimal after = before.add(quantity);
        stock.setCurrentStock(after);
        stock.setUnitCost(unitCost);
        SparePartSiteStock saved = stockDAO.save(stock);
        SparePartTransaction transaction = createTransaction(saved, "STOCK_IN", quantity, unitCost, before, after,
                dto.getReferenceType(), dto.getReferenceId(), dto.getRemarks());
        notifyIfLowStock(saved);
        return toTransactionDTO(transaction);
    }

    public SparePartTransactionDTO adjustStock(Long stockId, SparePartTransactionDTO dto) {
        accessControlService.validatePermission("STOCK_TRANSACTION_CREATE");
        SparePartSiteStock stock = getStockForUpdate(stockId);
        accessControlService.validateSiteAccess(stock.getSite().getId());
        BigDecimal newStock = nonNegative(dto.getQuantity(), "Adjusted stock");
        BigDecimal before = stock.getCurrentStock();
        BigDecimal delta = newStock.subtract(before);
        stock.setCurrentStock(newStock);
        if (dto.getUnitCost() != null) {
            stock.setUnitCost(nonNegative(dto.getUnitCost(), "Unit cost"));
        }
        SparePartSiteStock saved = stockDAO.save(stock);
        SparePartTransaction transaction = createTransaction(saved, "ADJUSTMENT", delta, saved.getUnitCost(), before, newStock,
                dto.getReferenceType(), dto.getReferenceId(), dto.getRemarks());
        notifyIfLowStock(saved);
        return toTransactionDTO(transaction);
    }

    @Transactional(readOnly = true)
    public List<SparePartTransactionDTO> getTransactions(Long stockId) {
        accessControlService.validatePermission("STOCK_TRANSACTION_VIEW");
        SparePartSiteStock stock = getStockEntity(stockId);
        accessControlService.validateSiteAccess(stock.getSite().getId());
        return transactionDAO.findByStockId(stockId).stream().map(this::toTransactionDTO).collect(Collectors.toList());
    }

    SparePartSiteStock consumeStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks) {
        SparePartSiteStock stock = getStockForUpdate(stockId);
        BigDecimal used = positive(quantity, "Quantity used");
        BigDecimal before = stock.getCurrentStock();
        BigDecimal after = before.subtract(used);
        if (after.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Insufficient stock for " + stock.getSparePart().getPartCode() + ". Available: " + before);
        }
        stock.setCurrentStock(after);
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "USAGE", used.negate(), saved.getUnitCost(), before, after,
                "MAINTENANCE_ASSIGNMENT", assignmentId, remarks);
        notifyIfLowStock(saved);
        return saved;
    }

    SparePartSiteStock returnStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks) {
        SparePartSiteStock stock = getStockForUpdate(stockId);
        BigDecimal returned = positive(quantity, "Return quantity");
        BigDecimal before = stock.getCurrentStock();
        BigDecimal after = before.add(returned);
        stock.setCurrentStock(after);
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "RETURN", returned, saved.getUnitCost(), before, after,
                "MAINTENANCE_ASSIGNMENT", assignmentId, remarks);
        return saved;
    }

    SparePartSiteStock getStockEntity(Long stockId) {
        return stockDAO.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part stock not found with id: " + stockId));
    }

    private SparePartSiteStock getStockForUpdate(Long stockId) {
        return stockDAO.findByIdForUpdate(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part stock not found with id: " + stockId));
    }

    private void applyPart(SparePart part, SparePartDTO dto) {
        part.setPartCode(normalizeCode(dto.getPartCode()));
        part.setPartName(required(dto.getPartName(), "Part name"));
        part.setDescription(dto.getDescription());
        part.setCategory(dto.getCategory());
        part.setUnit(required(dto.getUnit(), "Unit").toUpperCase(Locale.ROOT));
        part.setStatus(defaultStatus(dto.getStatus()));
        if (dto.getPreferredVendorId() == null) {
            part.setPreferredVendor(null);
        } else {
            Vendor vendor = vendorService.getEntity(dto.getPreferredVendorId());
            if (dto.getSiteId() != null && !vendorService.isVendorAssignedToSite(vendor.getId(), dto.getSiteId())) {
                throw new InvalidOperationException("Preferred vendor is not assigned to the selected site.");
            }
            part.setPreferredVendor(vendor);
        }
    }

    private void applyStock(SparePartSiteStock stock, SparePartDTO dto) {
        Site site = siteService.getEntity(dto.getSiteId());
        stock.setSite(site);
        stock.setCurrentStock(nonNegative(dto.getCurrentStock(), "Current stock"));
        stock.setMinimumStock(nonNegative(dto.getMinimumStock(), "Minimum stock"));
        stock.setUnitCost(nonNegative(dto.getUnitCost(), "Unit cost"));
        stock.setStorageLocation(dto.getStorageLocation());
        stock.setStatus(defaultStatus(dto.getStatus()));
    }

    private SparePartTransaction createTransaction(SparePartSiteStock stock, String type, BigDecimal quantity, BigDecimal unitCost,
                                                   BigDecimal before, BigDecimal after, String referenceType, Long referenceId, String remarks) {
        SparePartTransaction transaction = new SparePartTransaction();
        transaction.setStock(stock);
        transaction.setSparePart(stock.getSparePart());
        transaction.setSite(stock.getSite());
        transaction.setTransactionType(type);
        transaction.setQuantity(quantity);
        transaction.setUnitCost(nonNegative(unitCost, "Unit cost"));
        transaction.setTotalCost(quantity.abs().multiply(transaction.getUnitCost()).setScale(2, RoundingMode.HALF_UP));
        transaction.setStockBefore(before);
        transaction.setStockAfter(after);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setRemarks(remarks);
        transaction.setTransactionDate(LocalDateTime.now());
        User user = accessControlService.getCurrentUser();
        transaction.setCreatedBy(user);
        return transactionDAO.save(transaction);
    }

    private void notifyIfLowStock(SparePartSiteStock stock) {
        if (stock.getCurrentStock().compareTo(stock.getMinimumStock()) <= 0) {
            notificationService.createLowStockAlert(stock);
        }
    }

    private void validateRequired(SparePartDTO dto) {
        required(dto.getPartCode(), "Part code");
        required(dto.getPartName(), "Part name");
        required(dto.getUnit(), "Unit");
        if (dto.getSiteId() == null) {
            throw new InvalidOperationException("Site is required");
        }
    }

    private String normalizeCode(String value) {
        return required(value, "Part code").toUpperCase(Locale.ROOT);
    }

    private String required(String value, String label) {
        if (value == null || value.trim().isEmpty()) {
            throw new InvalidOperationException(label + " is required");
        }
        return value.trim();
    }

    private String defaultStatus(String status) {
        return status == null || status.isBlank() ? "ACTIVE" : status.trim().toUpperCase(Locale.ROOT);
    }

    private BigDecimal positive(BigDecimal value, String label) {
        BigDecimal number = value == null ? BigDecimal.ZERO : value;
        if (number.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException(label + " must be greater than zero");
        }
        return number;
    }

    private BigDecimal nonNegative(BigDecimal value, String label) {
        BigDecimal number = value == null ? BigDecimal.ZERO : value;
        if (number.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException(label + " cannot be negative");
        }
        return number;
    }

    private SparePartDTO toDTO(SparePartSiteStock stock) {
        SparePart part = stock.getSparePart();
        SparePartDTO dto = new SparePartDTO();
        dto.setId(stock.getId());
        dto.setStockId(stock.getId());
        dto.setSparePartId(part.getId());
        dto.setPartCode(part.getPartCode());
        dto.setPartName(part.getPartName());
        dto.setDescription(part.getDescription());
        dto.setCategory(part.getCategory());
        dto.setUnit(part.getUnit());
        dto.setPreferredVendorId(part.getPreferredVendor() == null ? null : part.getPreferredVendor().getId());
        dto.setPreferredVendorName(part.getPreferredVendor() == null ? null : part.getPreferredVendor().getVendorName());
        dto.setStatus(stock.getStatus());
        dto.setSiteId(stock.getSite().getId());
        dto.setSiteCode(stock.getSite().getSiteCode());
        dto.setSiteName(stock.getSite().getSiteName());
        dto.setCurrentStock(stock.getCurrentStock());
        dto.setMinimumStock(stock.getMinimumStock());
        dto.setUnitCost(stock.getUnitCost());
        dto.setStorageLocation(stock.getStorageLocation());
        dto.setLowStock(stock.getCurrentStock().compareTo(stock.getMinimumStock()) <= 0);
        dto.setCreatedAt(stock.getCreatedAt());
        dto.setUpdatedAt(stock.getUpdatedAt());
        return dto;
    }

    private SparePartTransactionDTO toTransactionDTO(SparePartTransaction transaction) {
        SparePartTransactionDTO dto = new SparePartTransactionDTO();
        dto.setId(transaction.getId());
        dto.setStockId(transaction.getStock().getId());
        dto.setSparePartId(transaction.getSparePart().getId());
        dto.setPartCode(transaction.getSparePart().getPartCode());
        dto.setPartName(transaction.getSparePart().getPartName());
        dto.setSiteId(transaction.getSite().getId());
        dto.setSiteCode(transaction.getSite().getSiteCode());
        dto.setSiteName(transaction.getSite().getSiteName());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setQuantity(transaction.getQuantity());
        dto.setUnitCost(transaction.getUnitCost());
        dto.setTotalCost(transaction.getTotalCost());
        dto.setStockBefore(transaction.getStockBefore());
        dto.setStockAfter(transaction.getStockAfter());
        dto.setReferenceType(transaction.getReferenceType());
        dto.setReferenceId(transaction.getReferenceId());
        dto.setRemarks(transaction.getRemarks());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setCreatedBy(transaction.getCreatedBy() == null ? null : transaction.getCreatedBy().getId());
        dto.setCreatedByName(transaction.getCreatedBy() == null ? null : transaction.getCreatedBy().getUsername());
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }
}
