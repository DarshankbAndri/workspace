package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceSpareUsageDAO;
import com.example.cmmsApplication.dao.SparePartReorderDAO;
import com.example.cmmsApplication.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.dto.SparePartReorderDTO;
import com.example.cmmsApplication.entity.MaintenanceAssignment;
import com.example.cmmsApplication.entity.MaintenanceSpareUsage;
import com.example.cmmsApplication.entity.SparePartReorderRequest;
import com.example.cmmsApplication.entity.SparePartSiteStock;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceSpareUsageService {
    private static final String REQUESTED = "REQUESTED";
    private static final String MANAGER_APPROVED = "MANAGER_APPROVED";
    private static final String MANAGER_REJECTED = "MANAGER_REJECTED";
    private static final String STORE_REVIEW = "STORE_REVIEW";
    private static final String STOCK_AVAILABLE = "STOCK_AVAILABLE";
    private static final String STOCK_NOT_AVAILABLE = "STOCK_NOT_AVAILABLE";
    private static final String PURCHASE_REQUESTED = "PURCHASE_REQUESTED";
    private static final String PURCHASE_RECEIVED = "PURCHASE_RECEIVED";
    private static final String RESERVE_PENDING_APPROVAL = "RESERVE_PENDING_APPROVAL";
    private static final String RESERVED = "RESERVED";
    private static final String ISSUE_PENDING_APPROVAL = "ISSUE_PENDING_APPROVAL";
    private static final String ISSUED = "ISSUED";
    private static final String PARTIALLY_CONSUMED = "PARTIALLY_CONSUMED";
    private static final String CONSUMED = "CONSUMED";
    private static final String REJECTED = "REJECTED";
    private static final String CANCELLED = "CANCELLED";
    private static final String RETURNED = "RETURNED";

    private static final Set<String> CLOSED_STATUSES = Set.of(MANAGER_REJECTED, CONSUMED, RETURNED, CANCELLED);

    private final MaintenanceSpareUsageDAO usageDAO;
    private final SparePartReorderDAO reorderDAO;
    private final MaintenanceAssignmentService assignmentService;
    private final SparePartService sparePartService;
    private final AccessControlService accessControlService;
    private final ApprovalWorkflowService approvalWorkflowService;

    public MaintenanceSpareUsageService(MaintenanceSpareUsageDAO usageDAO,
                                        SparePartReorderDAO reorderDAO,
                                        MaintenanceAssignmentService assignmentService,
                                        SparePartService sparePartService,
                                        AccessControlService accessControlService,
                                        ApprovalWorkflowService approvalWorkflowService) {
        this.usageDAO = usageDAO;
        this.reorderDAO = reorderDAO;
        this.assignmentService = assignmentService;
        this.sparePartService = sparePartService;
        this.accessControlService = accessControlService;
        this.approvalWorkflowService = approvalWorkflowService;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceSpareUsageDTO> getAll(String status) {
        accessControlService.validatePermission("SPARE_USAGE_VIEW");
        String normalizedStatus = status == null || status.isBlank() ? null : normalizeStatus(status);
        List<MaintenanceSpareUsage> rows = normalizedStatus == null ? usageDAO.findAll() : usageDAO.findByStatus(normalizedStatus);
        return rows.stream()
                .filter((usage) -> canAccess(usage.getAssignment()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaintenanceSpareUsageDTO getById(Long id) {
        accessControlService.validatePermission("SPARE_USAGE_VIEW");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        return toDTO(usage);
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
            throw new InvalidOperationException("This spare part is already attached to the assignment. Edit the existing request quantity.");
        }
        SparePartSiteStock stock = sparePartService.getStockEntity(dto.getStockId());
        validateSameSite(assignment, stock);
        BigDecimal quantity = positive(requestedQty(dto), "Requested quantity");
        User currentUser = accessControlService.getCurrentUser();

        MaintenanceSpareUsage usage = new MaintenanceSpareUsage();
        usage.setAssignment(assignment);
        usage.setStock(stock);
        usage.setSparePart(stock.getSparePart());
        usage.setQuantityUsed(quantity);
        usage.setApprovedQty(BigDecimal.ZERO);
        usage.setIssuedQty(BigDecimal.ZERO);
        usage.setConsumedQty(BigDecimal.ZERO);
        usage.setReturnedQty(BigDecimal.ZERO);
        usage.setUnitCost(stock.getUnitCost());
        usage.setTotalCost(total(quantity, stock.getUnitCost()));
        usage.setStatus(REQUESTED);
        usage.setRemarks(dto.getRemarks());
        usage.setRequestedBy(currentUser);
        usage.setRequestedAt(LocalDateTime.now());
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO update(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_UPDATE");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, REQUESTED, "Only requested spare lines can be edited.");
        BigDecimal newQuantity = positive(requestedQty(dto), "Requested quantity");
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
        String status = normalizeStatus(usage.getStatus());
        if (RESERVED.equals(status)) {
            sparePartService.releaseReservedStock(usage.getStock().getId(), approvedQty(usage), assignmentId, "Spare request removed");
        } else if (!Set.of(REQUESTED, MANAGER_REJECTED, REJECTED, CANCELLED).contains(status)) {
            throw new InvalidOperationException("Only draft, rejected, or cancelled spare requests can be deleted.");
        }
        usageDAO.delete(usage);
    }

    public MaintenanceSpareUsageDTO managerApprove(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_MANAGER_APPROVE");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        if (CLOSED_STATUSES.contains(normalizeStatus(usage.getStatus()))) {
            throw new InvalidOperationException("Completed or cancelled spare requests cannot be approved.");
        }
        requireStatus(usage, REQUESTED, "Only requested spare lines can be manager-approved.");
        BigDecimal approved = positive(dto == null || dto.getApprovedQty() == null ? usage.getQuantityUsed() : dto.getApprovedQty(), "Approved quantity");
        if (approved.compareTo(usage.getQuantityUsed()) > 0) {
            throw new InvalidOperationException("Approved quantity cannot exceed requested quantity.");
        }
        usage.setApprovedQty(approved);
        usage.setManagerApprovedBy(accessControlService.getCurrentUser());
        usage.setStatus(MANAGER_APPROVED);
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO managerReject(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_MANAGER_APPROVE");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        if (CLOSED_STATUSES.contains(normalizeStatus(usage.getStatus()))) {
            throw new InvalidOperationException("Completed or cancelled spare requests cannot be rejected.");
        }
        requireStatus(usage, REQUESTED, "Only requested spare lines can be manager-rejected.");
        usage.setStatus(MANAGER_REJECTED);
        usage.setRejectedBy(accessControlService.getCurrentUser());
        usage.setRejectedAt(LocalDateTime.now());
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO checkStock(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_STORE_PROCESS");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        requireAnyStatus(usage, Set.of(MANAGER_APPROVED, STORE_REVIEW, STOCK_AVAILABLE, STOCK_NOT_AVAILABLE, PURCHASE_RECEIVED),
                "Store review can start only after manager approval.");
        BigDecimal needed = remainingToIssue(usage);
        SparePartSiteStock stock = sparePartService.getStockEntity(usage.getStock().getId());
        usage.setStock(stock);
        usage.setStoreApprovedBy(accessControlService.getCurrentUser());
        usage.setStatus(stock.getAvailableStock().compareTo(needed) >= 0 ? STOCK_AVAILABLE : STOCK_NOT_AVAILABLE);
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO reserve(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        return reserveById(usageId, dto);
    }

    public MaintenanceSpareUsageDTO reserveById(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_RESERVE");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        requireAnyStatus(usage, Set.of(STOCK_AVAILABLE, PURCHASE_RECEIVED), "Only stock-available spare requests can be reserved.");
        String remarks = effectiveRemarks(dto, usage.getRemarks());
        if (approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.SPARE_ISSUE, ApprovalWorkflowService.RESERVE)) {
            usage.setStatus(RESERVE_PENDING_APPROVAL);
            usage.setRemarks(remarks);
            MaintenanceSpareUsage saved = usageDAO.save(usage);
            ApprovalRequestDTO approval = createApproval(saved, ApprovalWorkflowService.RESERVE, remarks);
            return applyApproval(toDTO(saved), approval);
        }
        return toDTO(applyReserve(usage, remarks));
    }

    public MaintenanceSpareUsageDTO issue(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        return issueById(usageId, dto);
    }

    public MaintenanceSpareUsageDTO issueById(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_ISSUE");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        requireAnyStatus(usage, Set.of(RESERVED, STOCK_AVAILABLE, PURCHASE_RECEIVED), "Only available or reserved spare requests can be issued.");
        String remarks = effectiveRemarks(dto, usage.getRemarks());
        if (approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.SPARE_ISSUE, ApprovalWorkflowService.ISSUE)) {
            usage.setStatus(ISSUE_PENDING_APPROVAL);
            usage.setRemarks(remarks);
            MaintenanceSpareUsage saved = usageDAO.save(usage);
            ApprovalRequestDTO approval = createApproval(saved, ApprovalWorkflowService.ISSUE, remarks);
            return applyApproval(toDTO(saved), approval);
        }
        return toDTO(applyIssue(usage, remarks));
    }

    public SparePartReorderDTO createPurchaseRequest(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("REORDER_CREATE");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, STOCK_NOT_AVAILABLE, "Purchase request can be created only when stock is not available.");
        if (usage.getPurchaseRequest() != null) {
            return toReorderDTO(usage.getPurchaseRequest());
        }
        SparePartSiteStock stock = sparePartService.getStockEntity(usage.getStock().getId());
        BigDecimal shortage = approvedQty(usage).subtract(stock.getAvailableStock());
        if (shortage.compareTo(BigDecimal.ZERO) <= 0) {
            shortage = approvedQty(usage);
        }

        SparePartReorderRequest request = new SparePartReorderRequest();
        request.setStock(stock);
        request.setSparePart(stock.getSparePart());
        request.setSite(stock.getSite());
        request.setAssignment(usage.getAssignment());
        request.setSpareRequest(usage);
        request.setVendor(stock.getSparePart().getPreferredVendor());
        request.setRequestedQuantity(shortage);
        request.setEstimatedUnitCost(stock.getUnitCost());
        request.setEstimatedTotalCost(total(shortage, stock.getUnitCost()));
        request.setStatus("REQUESTED");
        request.setRemarks(effectiveRemarks(dto, "Created from spare request " + usage.getId()));
        request.setRequestedBy(accessControlService.getCurrentUser());
        SparePartReorderRequest saved = reorderDAO.save(request);
        usage.setPurchaseRequest(saved);
        usage.setStatus(PURCHASE_REQUESTED);
        usageDAO.save(usage);
        return toReorderDTO(saved);
    }

    public MaintenanceSpareUsageDTO markPurchaseReceived(Long id) {
        MaintenanceSpareUsage usage = getUsage(id);
        usage.setStatus(PURCHASE_RECEIVED);
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO consume(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        BigDecimal issued = issuedQty(usage);
        dto = dto == null ? new MaintenanceSpareUsageDTO() : dto;
        dto.setConsumedQty(issued);
        dto.setReturnedQty(returnedQty(usage));
        return consumeReturnById(usageId, dto);
    }

    public MaintenanceSpareUsageDTO consumeReturnById(Long id, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_CONSUME");
        MaintenanceSpareUsage usage = getUsage(id);
        validateAssignmentAccess(usage.getAssignment());
        requireAnyStatus(usage, Set.of(ISSUED, PARTIALLY_CONSUMED), "Only issued spare requests can be consumed or returned.");
        BigDecimal issued = issuedQty(usage);
        BigDecimal consumed = nonNegative(dto == null ? null : dto.getConsumedQty(), "Consumed quantity");
        BigDecimal returned = nonNegative(dto == null ? null : dto.getReturnedQty(), "Returned quantity");
        if (consumed.add(returned).compareTo(issued) > 0) {
            throw new InvalidOperationException("Consumed quantity plus returned quantity cannot exceed issued quantity.");
        }
        BigDecimal previousReturned = returnedQty(usage);
        if (returned.compareTo(previousReturned) < 0) {
            throw new InvalidOperationException("Returned quantity cannot be reduced once stock has been returned.");
        }
        BigDecimal returnDelta = returned.subtract(previousReturned);
        if (returnDelta.compareTo(BigDecimal.ZERO) > 0) {
            SparePartSiteStock stock = sparePartService.returnStock(usage.getStock().getId(), returnDelta, usage.getAssignment().getId(), effectiveRemarks(dto, "Unused issued spare returned"));
            usage.setStock(stock);
        }
        usage.setConsumedQty(consumed);
        usage.setReturnedQty(returned);
        usage.setConsumedBy(accessControlService.getCurrentUser());
        usage.setConsumedAt(LocalDateTime.now());
        usage.setTotalCost(total(consumed, usage.getUnitCost()));
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        if (returned.compareTo(BigDecimal.ZERO) > 0 && consumed.add(returned).compareTo(issued) == 0) {
            usage.setStatus(RETURNED);
        } else if (consumed.compareTo(issued) == 0) {
            usage.setStatus(CONSUMED);
        } else {
            usage.setStatus(PARTIALLY_CONSUMED);
        }
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO reject(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        return managerReject(usageId, dto);
    }

    public MaintenanceSpareUsageDTO cancel(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_CANCEL");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        String status = normalizeStatus(usage.getStatus());
        if (RESERVED.equals(status)) {
            sparePartService.releaseReservedStock(usage.getStock().getId(), approvedQty(usage), assignmentId, effectiveRemarks(dto, "Reservation cancelled"));
        } else if (!Set.of(REQUESTED, MANAGER_APPROVED, STORE_REVIEW, STOCK_AVAILABLE, STOCK_NOT_AVAILABLE, PURCHASE_REQUESTED).contains(status)) {
            throw new InvalidOperationException("Only open spare requests can be cancelled.");
        }
        usage.setStatus(CANCELLED);
        usage.setCancelledBy(accessControlService.getCurrentUser());
        usage.setCancelledAt(LocalDateTime.now());
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO returnIssued(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        dto = dto == null ? new MaintenanceSpareUsageDTO() : dto;
        dto.setConsumedQty(consumedQty(usage));
        dto.setReturnedQty(issuedQty(usage).subtract(consumedQty(usage)));
        return consumeReturnById(usageId, dto);
    }

    public void completeApprovedTransition(Long usageId, String actionCode) {
        MaintenanceSpareUsage usage = getUsage(usageId);
        if (ApprovalWorkflowService.RESERVE.equalsIgnoreCase(actionCode)) {
            requireStatus(usage, RESERVE_PENDING_APPROVAL, "Spare line is not pending reserve approval.");
            applyReserve(usage, usage.getRemarks());
            return;
        }
        if (ApprovalWorkflowService.ISSUE.equalsIgnoreCase(actionCode)) {
            requireStatus(usage, ISSUE_PENDING_APPROVAL, "Spare line is not pending issue approval.");
            applyIssue(usage, usage.getRemarks());
        }
    }

    public void completeRejectedTransition(Long usageId, String actionCode) {
        MaintenanceSpareUsage usage = getUsage(usageId);
        if (ApprovalWorkflowService.RESERVE.equalsIgnoreCase(actionCode)) {
            requireStatus(usage, RESERVE_PENDING_APPROVAL, "Spare line is not pending reserve approval.");
            usage.setStatus(STOCK_AVAILABLE);
            usageDAO.save(usage);
            return;
        }
        if (ApprovalWorkflowService.ISSUE.equalsIgnoreCase(actionCode)) {
            requireStatus(usage, ISSUE_PENDING_APPROVAL, "Spare line is not pending issue approval.");
            usage.setStatus(RESERVED);
            usageDAO.save(usage);
        }
    }

    @Transactional(readOnly = true)
    public BigDecimal getMaterialCost(Long assignmentId) {
        return usageDAO.findByAssignmentId(assignmentId).stream()
                .filter((usage) -> Set.of(CONSUMED, RETURNED, PARTIALLY_CONSUMED).contains(normalizeStatus(usage.getStatus())))
                .map((usage) -> total(consumedQty(usage), usage.getUnitCost()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private MaintenanceSpareUsage getUsage(Long id) {
        return usageDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare request not found with id: " + id));
    }

    private MaintenanceSpareUsage getUsage(Long assignmentId, Long usageId) {
        return usageDAO.findByIdAndAssignmentId(usageId, assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare request not found with id: " + usageId));
    }

    private boolean canAccess(MaintenanceAssignment assignment) {
        Long siteId = assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId();
        return siteId == null || accessControlService.isAdmin() || accessControlService.getAllowedSiteIds().contains(siteId);
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

    private BigDecimal requestedQty(MaintenanceSpareUsageDTO dto) {
        if (dto == null) {
            return BigDecimal.ZERO;
        }
        return dto.getRequestedQty() == null ? dto.getQuantityUsed() : dto.getRequestedQty();
    }

    private BigDecimal approvedQty(MaintenanceSpareUsage usage) {
        return usage.getApprovedQty() == null || usage.getApprovedQty().compareTo(BigDecimal.ZERO) <= 0
                ? usage.getQuantityUsed()
                : usage.getApprovedQty();
    }

    private BigDecimal issuedQty(MaintenanceSpareUsage usage) {
        return usage.getIssuedQty() == null ? BigDecimal.ZERO : usage.getIssuedQty();
    }

    private BigDecimal consumedQty(MaintenanceSpareUsage usage) {
        return usage.getConsumedQty() == null ? BigDecimal.ZERO : usage.getConsumedQty();
    }

    private BigDecimal returnedQty(MaintenanceSpareUsage usage) {
        return usage.getReturnedQty() == null ? BigDecimal.ZERO : usage.getReturnedQty();
    }

    private BigDecimal remainingToIssue(MaintenanceSpareUsage usage) {
        BigDecimal remaining = approvedQty(usage).subtract(issuedQty(usage));
        return remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining;
    }

    private BigDecimal positive(BigDecimal value, String label) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException(label + " must be greater than zero");
        }
        return value;
    }

    private BigDecimal nonNegative(BigDecimal value, String label) {
        BigDecimal number = value == null ? BigDecimal.ZERO : value;
        if (number.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException(label + " cannot be negative");
        }
        return number;
    }

    private BigDecimal total(BigDecimal quantity, BigDecimal unitCost) {
        return (quantity == null ? BigDecimal.ZERO : quantity)
                .multiply(unitCost == null ? BigDecimal.ZERO : unitCost)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private MaintenanceSpareUsage applyReserve(MaintenanceSpareUsage usage, String remarks) {
        SparePartSiteStock stock = sparePartService.reserveStock(usage.getStock().getId(), remainingToIssue(usage), usage.getAssignment().getId(), remarks);
        usage.setStock(stock);
        usage.setUnitCost(stock.getUnitCost());
        usage.setTotalCost(total(approvedQty(usage), stock.getUnitCost()));
        usage.setStatus(RESERVED);
        usage.setReservedBy(accessControlService.getCurrentUser());
        usage.setStoreApprovedBy(accessControlService.getCurrentUser());
        usage.setReservedAt(LocalDateTime.now());
        usage.setRemarks(remarks);
        return usageDAO.save(usage);
    }

    private MaintenanceSpareUsage applyIssue(MaintenanceSpareUsage usage, String remarks) {
        BigDecimal issueQty = remainingToIssue(usage);
        SparePartSiteStock stock;
        if (shouldIssueReservedStock(usage, issueQty)) {
            stock = sparePartService.issueReservedStock(usage.getStock().getId(), issueQty, usage.getAssignment().getId(), remarks);
        } else {
            stock = sparePartService.issueStock(usage.getStock().getId(), issueQty, usage.getAssignment().getId(), remarks);
        }
        usage.setStock(stock);
        usage.setUnitCost(stock.getUnitCost());
        usage.setIssuedQty(issuedQty(usage).add(issueQty));
        usage.setTotalCost(total(usage.getIssuedQty(), stock.getUnitCost()));
        usage.setStatus(ISSUED);
        usage.setIssuedBy(accessControlService.getCurrentUser());
        usage.setStoreApprovedBy(accessControlService.getCurrentUser());
        usage.setIssuedAt(LocalDateTime.now());
        usage.setRemarks(remarks);
        return usageDAO.save(usage);
    }

    private boolean shouldIssueReservedStock(MaintenanceSpareUsage usage, BigDecimal issueQty) {
        String status = normalizeStatus(usage.getStatus());
        boolean requestHadReservation = RESERVED.equals(status)
                || (ISSUE_PENDING_APPROVAL.equals(status) && usage.getReservedAt() != null);
        if (!requestHadReservation) {
            return false;
        }
        SparePartSiteStock stock = sparePartService.getStockEntity(usage.getStock().getId());
        BigDecimal reservedStock = stock.getReservedStock() == null ? BigDecimal.ZERO : stock.getReservedStock();
        return reservedStock.compareTo(issueQty) >= 0;
    }

    private ApprovalRequestDTO createApproval(MaintenanceSpareUsage usage, String actionCode, String remarks) {
        return approvalWorkflowService.createApprovalRequest(
                ApprovalWorkflowService.SPARE_ISSUE,
                actionCode,
                usage.getId(),
                usage.getAssignment().getRequest().getRequestNumber() + " / " + usage.getSparePart().getPartCode(),
                usage.getStock().getSite(),
                Map.of(
                        "assignmentId", usage.getAssignment().getId(),
                        "stockId", usage.getStock().getId(),
                        "partCode", usage.getSparePart().getPartCode(),
                        "partName", usage.getSparePart().getPartName(),
                        "quantity", approvedQty(usage),
                        "unitCost", usage.getUnitCost(),
                        "totalCost", usage.getTotalCost()
                ),
                remarks == null || remarks.isBlank() ? "Spare issue " + actionCode.toLowerCase(Locale.ROOT) + " pending approval" : remarks
        );
    }

    private MaintenanceSpareUsageDTO applyApproval(MaintenanceSpareUsageDTO dto, ApprovalRequestDTO approval) {
        if (approval != null) {
            dto.setApprovalRequestId(approval.getId());
            dto.setApprovalStatus(approval.getApprovalStatus());
        }
        return dto;
    }

    private void requireStatus(MaintenanceSpareUsage usage, String expected, String message) {
        if (!expected.equalsIgnoreCase(usage.getStatus())) {
            throw new InvalidOperationException(message);
        }
    }

    private void requireAnyStatus(MaintenanceSpareUsage usage, Set<String> expected, String message) {
        if (!expected.contains(normalizeStatus(usage.getStatus()))) {
            throw new InvalidOperationException(message);
        }
    }

    private String normalizeStatus(String status) {
        return status == null ? REQUESTED : status.trim().toUpperCase(Locale.ROOT);
    }

    private String effectiveRemarks(MaintenanceSpareUsageDTO dto, String fallback) {
        if (dto == null || dto.getRemarks() == null || dto.getRemarks().isBlank()) {
            return fallback;
        }
        return dto.getRemarks();
    }

    private Long userId(User user) {
        return user == null ? null : user.getId();
    }

    private String username(User user) {
        return user == null ? null : user.getUsername();
    }

    private MaintenanceSpareUsageDTO toDTO(MaintenanceSpareUsage usage) {
        SparePartSiteStock stock = usage.getStock();
        MaintenanceSpareUsageDTO dto = new MaintenanceSpareUsageDTO();
        dto.setId(usage.getId());
        dto.setAssignmentId(usage.getAssignment().getId());
        dto.setMaintenanceRequestId(usage.getAssignment().getRequest().getId());
        dto.setMaintenanceRequestNumber(usage.getAssignment().getRequest().getRequestNumber());
        dto.setStockId(stock.getId());
        dto.setSparePartId(usage.getSparePart().getId());
        dto.setPartCode(usage.getSparePart().getPartCode());
        dto.setPartName(usage.getSparePart().getPartName());
        dto.setUnit(usage.getSparePart().getUnit());
        dto.setSiteId(stock.getSite().getId());
        dto.setSiteName(stock.getSite().getSiteName());
        dto.setCurrentStock(stock.getCurrentStock());
        dto.setReservedStock(stock.getReservedStock());
        dto.setAvailableStock(stock.getAvailableStock());
        dto.setQuantityUsed(usage.getQuantityUsed());
        dto.setRequestedQty(usage.getQuantityUsed());
        dto.setApprovedQty(approvedQty(usage));
        dto.setIssuedQty(issuedQty(usage));
        dto.setConsumedQty(consumedQty(usage));
        dto.setReturnedQty(returnedQty(usage));
        dto.setUnitCost(usage.getUnitCost());
        dto.setTotalCost(usage.getTotalCost());
        dto.setStatus(usage.getStatus());
        dto.setRemarks(usage.getRemarks());
        dto.setRequestedBy(userId(usage.getRequestedBy()));
        dto.setRequestedByName(username(usage.getRequestedBy()));
        dto.setManagerApprovedBy(userId(usage.getManagerApprovedBy()));
        dto.setManagerApprovedByName(username(usage.getManagerApprovedBy()));
        dto.setStoreApprovedBy(userId(usage.getStoreApprovedBy()));
        dto.setStoreApprovedByName(username(usage.getStoreApprovedBy()));
        dto.setReservedBy(userId(usage.getReservedBy()));
        dto.setReservedByName(username(usage.getReservedBy()));
        dto.setIssuedBy(userId(usage.getIssuedBy()));
        dto.setIssuedByName(username(usage.getIssuedBy()));
        dto.setConsumedBy(userId(usage.getConsumedBy()));
        dto.setConsumedByName(username(usage.getConsumedBy()));
        dto.setRejectedBy(userId(usage.getRejectedBy()));
        dto.setRejectedByName(username(usage.getRejectedBy()));
        dto.setCancelledBy(userId(usage.getCancelledBy()));
        dto.setCancelledByName(username(usage.getCancelledBy()));
        dto.setPurchaseRequestId(usage.getPurchaseRequest() == null ? null : usage.getPurchaseRequest().getId());
        dto.setPurchaseRequestStatus(usage.getPurchaseRequest() == null ? null : usage.getPurchaseRequest().getStatus());
        dto.setRequestedAt(usage.getRequestedAt());
        dto.setReservedAt(usage.getReservedAt());
        dto.setIssuedAt(usage.getIssuedAt());
        dto.setConsumedAt(usage.getConsumedAt());
        dto.setRejectedAt(usage.getRejectedAt());
        dto.setCancelledAt(usage.getCancelledAt());
        dto.setCreatedAt(usage.getCreatedAt());
        dto.setUpdatedAt(usage.getUpdatedAt());
        return dto;
    }

    private SparePartReorderDTO toReorderDTO(SparePartReorderRequest request) {
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
