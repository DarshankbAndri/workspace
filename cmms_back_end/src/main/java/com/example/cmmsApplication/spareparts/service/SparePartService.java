package com.example.cmmsApplication.spareparts.service;


import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.notification.service.NotificationService;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.vendor.service.VendorService;
import com.example.cmmsApplication.spareparts.dao.SparePartDAO;
import com.example.cmmsApplication.spareparts.dao.SparePartReorderDAO;
import com.example.cmmsApplication.spareparts.dao.SparePartSiteStockDAO;
import com.example.cmmsApplication.spareparts.dao.SparePartTransactionDAO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartImportResultDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.spareparts.dto.StockTransferDTO;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.spareparts.entity.SparePart;
import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import com.example.cmmsApplication.spareparts.entity.SparePartTransaction;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class SparePartService {
    private final SparePartDAO sparePartDAO;
    private final SparePartSiteStockDAO stockDAO;
    private final SparePartTransactionDAO transactionDAO;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final SparePartReorderDAO reorderDAO;
    private final SiteService siteService;
    private final VendorService vendorService;
    private final AccessControlService accessControlService;
    private final ListSearchService listSearchService;
    private final NotificationService notificationService;

    public SparePartService(SparePartDAO sparePartDAO,
                            SparePartSiteStockDAO stockDAO,
                            SparePartTransactionDAO transactionDAO,
                            MaintenanceAssignmentDAO assignmentDAO,
                            SparePartReorderDAO reorderDAO,
                            SiteService siteService,
                            VendorService vendorService,
                            AccessControlService accessControlService,
                            ListSearchService listSearchService,
                            NotificationService notificationService) {
        this.sparePartDAO = sparePartDAO;
        this.stockDAO = stockDAO;
        this.transactionDAO = transactionDAO;
        this.assignmentDAO = assignmentDAO;
        this.reorderDAO = reorderDAO;
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
        if (newStock.compareTo(stock.getReservedStock()) < 0) {
            throw new InvalidOperationException("Adjusted stock cannot be lower than reserved stock. Reserved: " + stock.getReservedStock());
        }
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

    public List<SparePartTransactionDTO> transferStock(Long sourceStockId, StockTransferDTO dto) {
        accessControlService.validatePermission("STOCK_TRANSACTION_CREATE");
        SparePartSiteStock source = getStockForUpdate(sourceStockId);
        accessControlService.validateSiteAccess(source.getSite().getId());
        accessControlService.validateSiteAccess(dto.getTargetSiteId());
        if (source.getSite().getId().equals(dto.getTargetSiteId())) {
            throw new InvalidOperationException("Target site must be different from source site");
        }
        BigDecimal quantity = positive(dto.getQuantity(), "Transfer quantity");
        BigDecimal sourceBefore = source.getCurrentStock();
        BigDecimal availableBefore = source.getAvailableStock();
        BigDecimal sourceAfter = sourceBefore.subtract(quantity);
        if (availableBefore.compareTo(quantity) < 0) {
            throw new InvalidOperationException("Insufficient available stock for transfer. Available: " + availableBefore);
        }

        SparePartSiteStock target = stockDAO.findBySparePartIdAndSiteId(source.getSparePart().getId(), dto.getTargetSiteId())
                .orElseGet(() -> {
                    SparePartSiteStock created = new SparePartSiteStock();
                    created.setSparePart(source.getSparePart());
                    created.setSite(siteService.getEntity(dto.getTargetSiteId()));
                    created.setCurrentStock(BigDecimal.ZERO);
                    created.setReservedStock(BigDecimal.ZERO);
                    created.setMinimumStock(BigDecimal.ZERO);
                    created.setUnitCost(source.getUnitCost());
                    created.setStorageLocation(dto.getTargetStorageLocation());
                    created.setStatus("ACTIVE");
                    return stockDAO.save(created);
                });
        target = getStockForUpdate(target.getId());

        source.setCurrentStock(sourceAfter);
        SparePartSiteStock savedSource = stockDAO.save(source);
        BigDecimal targetBefore = target.getCurrentStock();
        BigDecimal targetAfter = targetBefore.add(quantity);
        target.setCurrentStock(targetAfter);
        target.setUnitCost(source.getUnitCost());
        if (dto.getTargetStorageLocation() != null && !dto.getTargetStorageLocation().isBlank()) {
            target.setStorageLocation(dto.getTargetStorageLocation());
        }
        SparePartSiteStock savedTarget = stockDAO.save(target);

        String remarks = dto.getRemarks() == null ? "Site transfer" : dto.getRemarks();
        SparePartTransaction out = createTransaction(savedSource, "TRANSFER_OUT", quantity.negate(), savedSource.getUnitCost(), sourceBefore, sourceAfter,
                "SPARE_STOCK_TRANSFER", savedTarget.getId(), remarks);
        SparePartTransaction in = createTransaction(savedTarget, "TRANSFER_IN", quantity, savedTarget.getUnitCost(), targetBefore, targetAfter,
                "SPARE_STOCK_TRANSFER", savedSource.getId(), remarks);
        notifyIfLowStock(savedSource);
        notifyIfLowStock(savedTarget);
        return List.of(toTransactionDTO(out), toTransactionDTO(in));
    }

    public SparePartImportResultDTO importSpareParts(MultipartFile file) {
        accessControlService.validatePermission("SPARE_PART_CREATE");
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Import file is required");
        }
        try {
            List<List<String>> rows = readImportRows(file);
            return importRows(rows);
        } catch (IOException ex) {
            throw new InvalidOperationException("Unable to read import file: " + ex.getMessage());
        }
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
        BigDecimal available = stock.getAvailableStock();
        BigDecimal after = before.subtract(used);
        if (available.compareTo(used) < 0) {
            throw new InvalidOperationException("Insufficient available stock for " + stock.getSparePart().getPartCode() + ". Available: " + available);
        }
        stock.setCurrentStock(after);
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "USAGE", used.negate(), saved.getUnitCost(), before, after,
                "MAINTENANCE_ASSIGNMENT", assignmentId, remarks);
        notifyIfLowStock(saved);
        return saved;
    }

    SparePartSiteStock reserveStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks) {
        SparePartSiteStock stock = getStockForUpdate(stockId);
        BigDecimal reserved = positive(quantity, "Reservation quantity");
        BigDecimal available = stock.getAvailableStock();
        if (available.compareTo(reserved) < 0) {
            throw new InvalidOperationException("Insufficient available stock for " + stock.getSparePart().getPartCode() + ". Available: " + available);
        }
        BigDecimal before = stock.getCurrentStock();
        stock.setReservedStock(stock.getReservedStock().add(reserved));
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "RESERVATION", reserved, saved.getUnitCost(), before, saved.getCurrentStock(),
                "MAINTENANCE_ASSIGNMENT", assignmentId, remarks);
        notifyIfLowStock(saved);
        return saved;
    }

    SparePartSiteStock releaseReservedStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks) {
        SparePartSiteStock stock = getStockForUpdate(stockId);
        BigDecimal released = positive(quantity, "Reservation release quantity");
        if (stock.getReservedStock().compareTo(released) < 0) {
            throw new InvalidOperationException("Reserved stock is lower than release quantity. Reserved: " + stock.getReservedStock());
        }
        BigDecimal before = stock.getCurrentStock();
        stock.setReservedStock(stock.getReservedStock().subtract(released));
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "RESERVATION_RELEASE", released.negate(), saved.getUnitCost(), before, saved.getCurrentStock(),
                "MAINTENANCE_ASSIGNMENT", assignmentId, remarks);
        return saved;
    }

    SparePartSiteStock issueReservedStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks) {
        SparePartSiteStock stock = getStockForUpdate(stockId);
        BigDecimal issued = positive(quantity, "Issue quantity");
        if (stock.getReservedStock().compareTo(issued) < 0) {
            throw new InvalidOperationException("Reserved stock is lower than issue quantity. Reserved: " + stock.getReservedStock());
        }
        BigDecimal before = stock.getCurrentStock();
        BigDecimal after = before.subtract(issued);
        if (after.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Insufficient stock for issue. Current stock: " + before);
        }
        stock.setReservedStock(stock.getReservedStock().subtract(issued));
        stock.setCurrentStock(after);
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "ISSUE", issued.negate(), saved.getUnitCost(), before, after,
                "MAINTENANCE_ASSIGNMENT", assignmentId, remarks);
        notifyIfLowStock(saved);
        return saved;
    }

    SparePartSiteStock issueStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks) {
        SparePartSiteStock stock = getStockForUpdate(stockId);
        BigDecimal issued = positive(quantity, "Issue quantity");
        BigDecimal available = stock.getAvailableStock();
        if (available.compareTo(issued) < 0) {
            throw new InvalidOperationException("Insufficient available stock for issue. Available: " + available);
        }
        BigDecimal before = stock.getCurrentStock();
        BigDecimal after = before.subtract(issued);
        stock.setCurrentStock(after);
        SparePartSiteStock saved = stockDAO.save(stock);
        createTransaction(saved, "ISSUE", issued.negate(), saved.getUnitCost(), before, after,
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
        stock.setReservedStock(nonNegative(dto.getReservedStock(), "Reserved stock"));
        stock.setMinimumStock(nonNegative(dto.getMinimumStock(), "Minimum stock"));
        stock.setUnitCost(nonNegative(dto.getUnitCost(), "Unit cost"));
        stock.setStorageLocation(dto.getStorageLocation());
        stock.setStatus(defaultStatus(dto.getStatus()));
    }

    private SparePartImportResultDTO importRows(List<List<String>> rows) {
        SparePartImportResultDTO result = new SparePartImportResultDTO();
        for (int index = 0; index < rows.size(); index++) {
            List<String> row = rows.get(index);
            if (row.stream().allMatch((value) -> value == null || value.isBlank())) {
                continue;
            }
            if (index == 0 && row.get(0).toLowerCase(Locale.ROOT).contains("part")) {
                continue;
            }
            try {
                SparePartDTO dto = toImportDTO(row);
                accessControlService.validateSiteAccess(dto.getSiteId());
                String partCode = normalizeCode(dto.getPartCode());
                SparePart part = sparePartDAO.findByPartCode(partCode).orElse(null);
                if (part == null) {
                    SparePartDTO created = create(dto);
                    if (created.getId() != null) {
                        result.incrementCreated();
                    }
                } else {
                    SparePartSiteStock stock = stockDAO.findBySparePartIdAndSiteId(part.getId(), dto.getSiteId()).orElse(null);
                    if (stock == null) {
                        SparePartSiteStock newStock = new SparePartSiteStock();
                        newStock.setSparePart(part);
                        applyStock(newStock, dto);
                        stockDAO.save(newStock);
                        result.incrementCreated();
                    } else {
                        dto.setPartCode(part.getPartCode());
                        update(stock.getId(), dto);
                        if (dto.getCurrentStock() != null) {
                            SparePartTransactionDTO adjustment = new SparePartTransactionDTO();
                            adjustment.setQuantity(dto.getCurrentStock());
                            adjustment.setUnitCost(dto.getUnitCost());
                            adjustment.setRemarks("Import stock adjustment");
                            adjustStock(stock.getId(), adjustment);
                        }
                        result.incrementUpdated();
                    }
                }
            } catch (RuntimeException ex) {
                result.addError("Row " + (index + 1) + ": " + ex.getMessage());
            }
        }
        return result;
    }

    private SparePartDTO toImportDTO(List<String> row) {
        SparePartDTO dto = new SparePartDTO();
        dto.setPartCode(value(row, 0));
        dto.setPartName(value(row, 1));
        dto.setUnit(defaultValue(value(row, 2), "PCS"));
        dto.setSiteId(toLong(value(row, 3)));
        dto.setCurrentStock(toBigDecimal(value(row, 4)));
        dto.setMinimumStock(toBigDecimal(value(row, 5)));
        dto.setUnitCost(toBigDecimal(value(row, 6)));
        dto.setCategory(value(row, 7));
        dto.setDescription(value(row, 8));
        dto.setStorageLocation(value(row, 9));
        dto.setPreferredVendorId(toLong(value(row, 10)));
        dto.setStatus(defaultValue(value(row, 11), "ACTIVE"));
        return dto;
    }

    private List<List<String>> readImportRows(MultipartFile file) throws IOException {
        String name = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase(Locale.ROOT);
        if (name.endsWith(".csv")) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                return reader.lines()
                        .map((line) -> Arrays.stream(line.split(",", -1)).map(String::trim).collect(Collectors.toList()))
                        .collect(Collectors.toList());
            }
        }
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            List<List<String>> rows = new ArrayList<>();
            for (Row row : workbook.getSheetAt(0)) {
                List<String> values = new ArrayList<>();
                int lastCell = Math.max(row.getLastCellNum(), 0);
                for (int cellIndex = 0; cellIndex < lastCell; cellIndex++) {
                    Cell cell = row.getCell(cellIndex);
                    values.add(formatter.formatCellValue(cell).trim());
                }
                rows.add(values);
            }
            return rows;
        }
    }

    private String value(List<String> row, int index) {
        return index >= row.size() ? null : row.get(index);
    }

    private String defaultValue(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private Long toLong(String value) {
        return value == null || value.isBlank() ? null : Long.valueOf(value.trim());
    }

    private BigDecimal toBigDecimal(String value) {
        return value == null || value.isBlank() ? BigDecimal.ZERO : new BigDecimal(value.trim());
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
        if (stock.getAvailableStock().compareTo(stock.getMinimumStock()) <= 0) {
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
        dto.setReservedStock(stock.getReservedStock());
        dto.setAvailableStock(stock.getAvailableStock());
        dto.setMinimumStock(stock.getMinimumStock());
        dto.setUnitCost(stock.getUnitCost());
        dto.setStorageLocation(stock.getStorageLocation());
        dto.setLowStock(stock.getAvailableStock().compareTo(stock.getMinimumStock()) <= 0);
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
        enrichTransactionContext(transaction, dto);
        dto.setBusinessDescription(buildBusinessDescription(transaction, dto));
        return dto;
    }

    private void enrichTransactionContext(SparePartTransaction transaction, SparePartTransactionDTO dto) {
        if (transaction.getReferenceType() == null || transaction.getReferenceId() == null) {
            return;
        }
        switch (transaction.getReferenceType()) {
            case "MAINTENANCE_ASSIGNMENT":
                enrichAssignmentContext(transaction.getReferenceId(), dto);
                break;
            case "SPARE_STOCK_TRANSFER":
                enrichTransferContext(transaction, dto);
                break;
            case "PURCHASE_REQUEST":
                enrichPurchaseRequestContext(transaction.getReferenceId(), dto);
                break;
            default:
                dto.setReferenceCode(transaction.getReferenceType() + "-" + transaction.getReferenceId());
                break;
        }
    }

    private void enrichAssignmentContext(Long assignmentId, SparePartTransactionDTO dto) {
        assignmentDAO.findById(assignmentId).ifPresent(assignment -> {
            dto.setAssignmentId(assignment.getId());
            dto.setAssignmentStatus(assignment.getStatus());
            dto.setReferenceCode("ASSIGNMENT-" + assignment.getId());
            if (assignment.getAssignedTo() != null) {
                dto.setAssignedToName(assignment.getAssignedTo());
            }
            if (assignment.getRequest() != null) {
                applyMaintenanceRequestContext(assignment.getRequest(), dto);
            }
        });
    }

    private void enrichTransferContext(SparePartTransaction transaction, SparePartTransactionDTO dto) {
        stockDAO.findById(transaction.getReferenceId()).ifPresent(counterpart -> {
            Site currentSite = transaction.getSite();
            Site counterpartSite = counterpart.getSite();
            if ("TRANSFER_OUT".equals(transaction.getTransactionType())) {
                applySite(currentSite, true, dto);
                applySite(counterpartSite, false, dto);
            } else if ("TRANSFER_IN".equals(transaction.getTransactionType())) {
                applySite(counterpartSite, true, dto);
                applySite(currentSite, false, dto);
            }
            if (counterpartSite != null) {
                dto.setReferenceCode(counterpartSite.getSiteCode());
            }
        });
    }

    private void enrichPurchaseRequestContext(Long purchaseRequestId, SparePartTransactionDTO dto) {
        reorderDAO.findById(purchaseRequestId).ifPresent(request -> {
            dto.setPurchaseRequestId(request.getId());
            dto.setPurchaseRequestStatus(request.getStatus());
            if (request.getAssignment() != null) {
                enrichAssignmentContext(request.getAssignment().getId(), dto);
            } else if (request.getSpareRequest() != null && request.getSpareRequest().getAssignment() != null) {
                enrichAssignmentContext(request.getSpareRequest().getAssignment().getId(), dto);
            }
            dto.setReferenceCode("PR-" + request.getId());
        });
    }

    private void applyMaintenanceRequestContext(MaintenanceRequest request, SparePartTransactionDTO dto) {
        dto.setMaintenanceRequestId(request.getId());
        dto.setMaintenanceRequestNumber(request.getRequestNumber());
        dto.setMaintenanceRequestTitle(request.getTitle());
        dto.setMaintenanceRequestStatus(request.getStatus());
        if (request.getEquipment() != null) {
            Equipment equipment = request.getEquipment();
            dto.setEquipmentId(equipment.getId());
            dto.setEquipmentCode(equipment.getEquipmentCode());
            dto.setEquipmentName(equipment.getEquipmentName());
        }
    }

    private void applySite(Site site, boolean source, SparePartTransactionDTO dto) {
        if (site == null) {
            return;
        }
        if (source) {
            dto.setSourceSiteId(site.getId());
            dto.setSourceSiteName(site.getSiteName());
        } else {
            dto.setTargetSiteId(site.getId());
            dto.setTargetSiteName(site.getSiteName());
        }
    }

    private String buildBusinessDescription(SparePartTransaction transaction, SparePartTransactionDTO dto) {
        if (dto.getPurchaseRequestId() != null) {
            String request = dto.getMaintenanceRequestNumber() == null ? "" : " for " + dto.getMaintenanceRequestNumber();
            return "Purchase request PR-" + dto.getPurchaseRequestId() + " stock received" + request;
        }
        if (dto.getMaintenanceRequestNumber() != null) {
            String equipment = dto.getEquipmentName() == null ? "" : " - " + dto.getEquipmentName();
            return dto.getTransactionType() + " for " + dto.getMaintenanceRequestNumber() + equipment;
        }
        if (dto.getSourceSiteName() != null || dto.getTargetSiteName() != null) {
            return "Transfer " + nullToDash(dto.getSourceSiteName()) + " to " + nullToDash(dto.getTargetSiteName());
        }
        if (transaction.getRemarks() != null && !transaction.getRemarks().isBlank()) {
            return transaction.getRemarks();
        }
        if (transaction.getReferenceType() != null && transaction.getReferenceId() != null) {
            return transaction.getTransactionType() + " - " + transaction.getReferenceType() + " " + transaction.getReferenceId();
        }
        return transaction.getTransactionType();
    }

    private String nullToDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}





