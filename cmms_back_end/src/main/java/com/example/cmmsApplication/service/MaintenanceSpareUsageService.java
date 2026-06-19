package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceSpareUsageDAO;
import com.example.cmmsApplication.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.entity.MaintenanceAssignment;
import com.example.cmmsApplication.entity.MaintenanceSpareUsage;
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
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceSpareUsageService {
    private static final String REQUESTED = "REQUESTED";
    private static final String RESERVE_PENDING_APPROVAL = "RESERVE_PENDING_APPROVAL";
    private static final String RESERVED = "RESERVED";
    private static final String ISSUE_PENDING_APPROVAL = "ISSUE_PENDING_APPROVAL";
    private static final String ISSUED = "ISSUED";
    private static final String CONSUMED = "CONSUMED";
    private static final String REJECTED = "REJECTED";
    private static final String CANCELLED = "CANCELLED";
    private static final String RETURNED = "RETURNED";

    private final MaintenanceSpareUsageDAO usageDAO;
    private final MaintenanceAssignmentService assignmentService;
    private final SparePartService sparePartService;
    private final AccessControlService accessControlService;
    private final ApprovalWorkflowService approvalWorkflowService;

    public MaintenanceSpareUsageService(MaintenanceSpareUsageDAO usageDAO,
                                        MaintenanceAssignmentService assignmentService,
                                        SparePartService sparePartService,
                                        AccessControlService accessControlService,
                                        ApprovalWorkflowService approvalWorkflowService) {
        this.usageDAO = usageDAO;
        this.assignmentService = assignmentService;
        this.sparePartService = sparePartService;
        this.accessControlService = accessControlService;
        this.approvalWorkflowService = approvalWorkflowService;
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
        BigDecimal quantity = positive(dto.getQuantityUsed());
        if (stock.getAvailableStock().compareTo(quantity) < 0) {
            throw new InvalidOperationException("Insufficient available stock for request. Available: " + stock.getAvailableStock());
        }
        User currentUser = accessControlService.getCurrentUser();

        MaintenanceSpareUsage usage = new MaintenanceSpareUsage();
        usage.setAssignment(assignment);
        usage.setStock(stock);
        usage.setSparePart(stock.getSparePart());
        usage.setQuantityUsed(quantity);
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
        if (!REQUESTED.equalsIgnoreCase(usage.getStatus())) {
            throw new InvalidOperationException("Only requested spare lines can be edited.");
        }
        BigDecimal newQuantity = positive(dto.getQuantityUsed());
        SparePartSiteStock stock = sparePartService.getStockEntity(usage.getStock().getId());
        if (stock.getAvailableStock().compareTo(newQuantity) < 0) {
            throw new InvalidOperationException("Insufficient available stock for request. Available: " + stock.getAvailableStock());
        }
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
        if (RESERVED.equalsIgnoreCase(usage.getStatus())) {
            sparePartService.releaseReservedStock(usage.getStock().getId(), usage.getQuantityUsed(), assignmentId, "Spare usage removed");
        } else if (ISSUED.equalsIgnoreCase(usage.getStatus()) || CONSUMED.equalsIgnoreCase(usage.getStatus())) {
            sparePartService.returnStock(usage.getStock().getId(), usage.getQuantityUsed(), assignmentId, "Spare usage removed");
        } else if (RESERVE_PENDING_APPROVAL.equalsIgnoreCase(usage.getStatus()) || ISSUE_PENDING_APPROVAL.equalsIgnoreCase(usage.getStatus())) {
            throw new InvalidOperationException("Cannot delete spare usage while approval is pending.");
        }
        usageDAO.delete(usage);
    }

    public MaintenanceSpareUsageDTO reserve(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_RESERVE");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, REQUESTED, "Only requested spare lines can be reserved.");
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
        accessControlService.validatePermission("SPARE_USAGE_ISSUE");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, RESERVED, "Only reserved spare lines can be issued.");
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

    public MaintenanceSpareUsageDTO consume(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_CONSUME");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, ISSUED, "Only issued spare lines can be consumed.");
        usage.setStatus(CONSUMED);
        usage.setConsumedBy(accessControlService.getCurrentUser());
        usage.setConsumedAt(LocalDateTime.now());
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO reject(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_REJECT");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, REQUESTED, "Only requested spare lines can be rejected.");
        usage.setStatus(REJECTED);
        usage.setRejectedBy(accessControlService.getCurrentUser());
        usage.setRejectedAt(LocalDateTime.now());
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO cancel(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_CANCEL");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        String status = normalizeStatus(usage.getStatus());
        if (RESERVED.equals(status)) {
            sparePartService.releaseReservedStock(usage.getStock().getId(), usage.getQuantityUsed(), assignmentId, effectiveRemarks(dto, "Reservation cancelled"));
        } else if (!REQUESTED.equals(status)) {
            throw new InvalidOperationException("Only requested or reserved spare lines can be cancelled.");
        }
        usage.setStatus(CANCELLED);
        usage.setCancelledBy(accessControlService.getCurrentUser());
        usage.setCancelledAt(LocalDateTime.now());
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public MaintenanceSpareUsageDTO returnIssued(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto) {
        accessControlService.validatePermission("SPARE_USAGE_RETURN");
        MaintenanceSpareUsage usage = getUsage(assignmentId, usageId);
        validateAssignmentAccess(usage.getAssignment());
        requireStatus(usage, ISSUED, "Only issued spare lines can be returned.");
        sparePartService.returnStock(usage.getStock().getId(), usage.getQuantityUsed(), assignmentId, effectiveRemarks(dto, "Issued spare returned"));
        usage.setStatus(RETURNED);
        usage.setRemarks(effectiveRemarks(dto, usage.getRemarks()));
        return toDTO(usageDAO.save(usage));
    }

    public void completeApprovedTransition(Long usageId, String actionCode) {
        MaintenanceSpareUsage usage = usageDAO.findById(usageId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare usage not found with id: " + usageId));
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
        MaintenanceSpareUsage usage = usageDAO.findById(usageId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare usage not found with id: " + usageId));
        if (ApprovalWorkflowService.RESERVE.equalsIgnoreCase(actionCode)) {
            requireStatus(usage, RESERVE_PENDING_APPROVAL, "Spare line is not pending reserve approval.");
            usage.setStatus(REJECTED);
            usage.setRejectedBy(accessControlService.getCurrentUser());
            usage.setRejectedAt(LocalDateTime.now());
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
                .filter((usage) -> CONSUMED.equalsIgnoreCase(usage.getStatus()))
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

    private MaintenanceSpareUsage applyReserve(MaintenanceSpareUsage usage, String remarks) {
        SparePartSiteStock stock = sparePartService.reserveStock(usage.getStock().getId(), usage.getQuantityUsed(), usage.getAssignment().getId(), remarks);
        usage.setStock(stock);
        usage.setUnitCost(stock.getUnitCost());
        usage.setTotalCost(total(usage.getQuantityUsed(), stock.getUnitCost()));
        usage.setStatus(RESERVED);
        usage.setReservedBy(accessControlService.getCurrentUser());
        usage.setReservedAt(LocalDateTime.now());
        usage.setRemarks(remarks);
        return usageDAO.save(usage);
    }

    private MaintenanceSpareUsage applyIssue(MaintenanceSpareUsage usage, String remarks) {
        SparePartSiteStock stock = sparePartService.issueReservedStock(usage.getStock().getId(), usage.getQuantityUsed(), usage.getAssignment().getId(), remarks);
        usage.setStock(stock);
        usage.setUnitCost(stock.getUnitCost());
        usage.setTotalCost(total(usage.getQuantityUsed(), stock.getUnitCost()));
        usage.setStatus(ISSUED);
        usage.setIssuedBy(accessControlService.getCurrentUser());
        usage.setIssuedAt(LocalDateTime.now());
        usage.setRemarks(remarks);
        return usageDAO.save(usage);
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
                        "quantity", usage.getQuantityUsed(),
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
        dto.setUnitCost(usage.getUnitCost());
        dto.setTotalCost(usage.getTotalCost());
        dto.setStatus(usage.getStatus());
        dto.setRemarks(usage.getRemarks());
        dto.setRequestedBy(userId(usage.getRequestedBy()));
        dto.setRequestedByName(username(usage.getRequestedBy()));
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
}
