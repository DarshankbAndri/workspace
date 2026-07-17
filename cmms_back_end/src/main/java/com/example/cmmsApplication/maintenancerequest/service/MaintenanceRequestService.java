package com.example.cmmsApplication.maintenancerequest.service;


import com.example.cmmsApplication.approval.service.ApprovalWorkflowService;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.service.EquipmentService;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.vendor.service.VendorService;
import com.example.cmmsApplication.vendoramc.service.VendorAmcService;
import com.example.cmmsApplication.maintenancerequest.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.approval.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestTransitionDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.maintenancerequest.enums.MaintenanceRequestAction;
import com.example.cmmsApplication.maintenancerequest.enums.MaintenanceRequestStatus;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceRequestService {
    private final MaintenanceRequestDAO requestDAO;
    private final EquipmentService equipmentService;
    private final SiteService siteService;
    private final AccessControlService accessControlService;
    private final ApprovalWorkflowService approvalWorkflowService;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final VendorAmcService vendorAmcService;
    private final VendorService vendorService;

    public MaintenanceRequestDTO create(MaintenanceRequestDTO dto) {
        accessControlService.validateSiteAccess(dto.getSiteId());
        MaintenanceRequest request = new MaintenanceRequest();
        apply(request, dto);
        if (request.getRequestNumber() == null || request.getRequestNumber().isBlank()) {
            request.setRequestNumber(generateRequestNumber());
        }
        if (requestDAO.existsByRequestNumber(request.getRequestNumber())) {
            throw new InvalidOperationException("Request number already exists: " + request.getRequestNumber());
        }
        boolean approvalRequired = approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.MAINTENANCE_REQUEST, ApprovalWorkflowService.CREATE);
        request.setStatus(approvalRequired ? MaintenanceRequestStatus.PENDING_APPROVAL.value() : MaintenanceRequestStatus.OPEN.value());
        MaintenanceRequest saved = requestDAO.save(request);
        MaintenanceRequestDTO result = toDTO(saved);
        if (approvalRequired) {
            ApprovalRequestDTO approval = approvalWorkflowService.createApprovalRequest(
                    ApprovalWorkflowService.MAINTENANCE_REQUEST,
                    ApprovalWorkflowService.CREATE,
                    saved.getId(),
                    saved.getRequestNumber(),
                    saved.getSite(),
                    Map.of("targetStatus", "OPEN"),
                    "Maintenance request creation pending approval"
            );
            applyApproval(result, approval);
        }
        return result;
    }

    public MaintenanceRequestDTO update(Long id, MaintenanceRequestDTO dto) {
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        accessControlService.validateSiteAccess(dto.getSiteId());
        String currentStatus = request.getStatus();
        apply(request, dto);
        request.setStatus(currentStatus);
        if (requestDAO.existsByRequestNumberAndIdNot(request.getRequestNumber(), id)) {
            throw new InvalidOperationException("Request number already exists: " + request.getRequestNumber());
        }
        return toDTO(requestDAO.save(request));
    }

    public MaintenanceRequestDTO transition(Long id, MaintenanceRequestTransitionDTO dto) {
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        MaintenanceRequestAction action = MaintenanceRequestAction.from(dto.getAction());
        ApprovalRequestDTO approval = transition(request, action, dto.getReason(), false);
        MaintenanceRequestDTO result = toDTO(requestDAO.save(request));
        applyApproval(result, approval);
        return result;
    }

    @Transactional(readOnly = true)
    public MaintenanceRequestDTO getById(Long id) {
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        return toDTO(request);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRequestDTO> getAll(Long siteId, String status) {
        List<MaintenanceRequest> requests;
        if (siteId != null && status != null && !status.isBlank()) {
            accessControlService.validateSiteAccess(siteId);
            requests = requestDAO.findBySiteIdAndStatus(siteId, status);
        } else if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
            requests = requestDAO.findBySiteId(siteId);
        } else if (status != null && !status.isBlank()) {
            requests = accessControlService.isAdmin() ? requestDAO.findByStatus(status) : requestDAO.findBySiteIdsAndStatus(accessControlService.getAllowedSiteIds(), status);
        } else {
            requests = accessControlService.isAdmin() ? requestDAO.findAll() : requestDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        }
        return requests.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        requestDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public MaintenanceRequest getEntity(Long id) {
        return requestDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    public void validateWorkAllowed(MaintenanceRequest request) {
        if (request == null || request.getStatus() == null) {
            return;
        }
        if (MaintenanceRequestStatus.from(request.getStatus()).blocksWork()) {
            throw new InvalidOperationException("Request must be approved/open before assignment or downtime can be created");
        }
    }

    public void syncStatusFromAssignment(MaintenanceRequest request, String assignmentStatus) {
        if (request == null || assignmentStatus == null || assignmentStatus.isBlank()) {
            return;
        }
        if ("ASSIGNED".equalsIgnoreCase(assignmentStatus)) {
            transition(request, MaintenanceRequestAction.ASSIGN, null, true);
            return;
        }
        if ("IN_PROGRESS".equalsIgnoreCase(assignmentStatus)) {
            advanceToInProgressFromAssignment(request);
            return;
        }
        if ("COMPLETED".equalsIgnoreCase(assignmentStatus)) {
            if (MaintenanceRequestStatus.COMPLETED == MaintenanceRequestStatus.from(request.getStatus())) {
                return;
            }
            advanceToInProgressFromAssignment(request);
            transition(request, MaintenanceRequestAction.COMPLETE, null, true);
        }
    }

    private void apply(MaintenanceRequest request, MaintenanceRequestDTO dto) {
        Site site = validateActiveSite(dto.getSiteId());
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        equipmentService.validateCanReceiveWork(equipment);
        if (equipment.getSite() == null || !site.getId().equals(equipment.getSite().getId())) {
            throw new InvalidOperationException("Selected equipment does not belong to selected site");
        }
        request.setSite(site);
        request.setEquipment(equipment);
        if (dto.getRequestNumber() != null && !dto.getRequestNumber().isBlank()) {
            request.setRequestNumber(dto.getRequestNumber());
        }
        request.setRequestType(dto.getRequestType() == null ? "BREAKDOWN" : dto.getRequestType());
        request.setPriority(dto.getPriority() == null ? "MEDIUM" : dto.getPriority());
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setReportedBy(dto.getReportedBy());
        request.setRequestedDate(dto.getRequestedDate());
        request.setTargetCompletionDate(dto.getTargetCompletionDate());
        applyAmc(request, dto, equipment);
    }

    private void applyAmc(MaintenanceRequest request, MaintenanceRequestDTO dto, Equipment equipment) {
        if (dto.getAmcContractId() == null) {
            request.setAmcContract(null);
            request.setAmcCovered(false);
            request.setExternalVendorAssignment(false);
            request.setVendor(null);
            request.setVendorReferenceNumber(dto.getVendorReferenceNumber());
            return;
        }
        VendorAmcContract amcContract = vendorAmcService.getEntity(dto.getAmcContractId());
        if (amcContract.getVendor() == null) {
            throw new InvalidOperationException("AMC contract does not have a vendor");
        }
        if (vendorAmcService.getActiveAmcForEquipment(equipment.getId()) == null
                || !dto.getAmcContractId().equals(vendorAmcService.getActiveAmcForEquipment(equipment.getId()).getId())) {
            throw new InvalidOperationException("Selected AMC is not active for this equipment");
        }
        Vendor vendor = Boolean.TRUE.equals(dto.getExternalVendorAssignment())
                ? amcContract.getVendor()
                : (dto.getVendorId() == null ? null : vendorService.getEntity(dto.getVendorId()));
        request.setAmcContract(amcContract);
        request.setAmcCovered(true);
        request.setExternalVendorAssignment(Boolean.TRUE.equals(dto.getExternalVendorAssignment()));
        request.setVendor(vendor);
        request.setVendorReferenceNumber(dto.getVendorReferenceNumber());
    }

    private Site validateActiveSite(Long siteId) {
        if (siteId == null) {
            throw new InvalidOperationException("Site is required");
        }
        Site site = siteService.getEntity(siteId);
        if (!"ACTIVE".equalsIgnoreCase(site.getStatus())) {
            throw new InvalidOperationException("Selected site is inactive");
        }
        return site;
    }

    private String generateRequestNumber() {
        return "MR-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + System.currentTimeMillis();
    }

    private MaintenanceRequestDTO toDTO(MaintenanceRequest request) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        dto.setId(request.getId());
        dto.setRequestNumber(request.getRequestNumber());
        dto.setEquipmentId(request.getEquipment().getId());
        dto.setEquipmentCode(request.getEquipment().getEquipmentCode());
        dto.setEquipmentName(request.getEquipment().getEquipmentName());
        dto.setSiteId(request.getSite() == null ? null : request.getSite().getId());
        dto.setSiteCode(request.getSite() == null ? null : request.getSite().getSiteCode());
        dto.setSiteName(request.getSite() == null ? null : request.getSite().getSiteName());
        dto.setRequestType(request.getRequestType());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setReportedBy(request.getReportedBy());
        dto.setRequestedDate(request.getRequestedDate());
        dto.setTargetCompletionDate(request.getTargetCompletionDate());
        dto.setAmcContractId(request.getAmcContract() == null ? null : request.getAmcContract().getId());
        dto.setAmcContractNumber(request.getAmcContract() == null ? null : request.getAmcContract().getContractNumber());
        dto.setAmcCovered(request.getAmcCovered());
        dto.setExternalVendorAssignment(request.getExternalVendorAssignment());
        dto.setVendorId(request.getVendor() == null ? null : request.getVendor().getId());
        dto.setVendorName(request.getVendor() == null ? null : request.getVendor().getVendorName());
        dto.setVendorReferenceNumber(request.getVendorReferenceNumber());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }

    private void validateRequestCanClose(MaintenanceRequest request) {
        List<MaintenanceAssignment> assignments = assignmentDAO.findByRequestId(request.getId());
        if (assignments.isEmpty()) {
            throw new InvalidOperationException("Complete at least one assignment before closing the request");
        }
        boolean hasCompletedAssignment = assignments.stream().anyMatch((assignment) -> "COMPLETED".equalsIgnoreCase(assignment.getStatus()));
        boolean hasOpenAssignment = assignments.stream().anyMatch((assignment) -> !("COMPLETED".equalsIgnoreCase(assignment.getStatus()) || "CANCELLED".equalsIgnoreCase(assignment.getStatus())));
        if (!hasCompletedAssignment || hasOpenAssignment) {
            throw new InvalidOperationException("All open assignments must be completed before closing the request");
        }
    }

    private ApprovalRequestDTO transition(MaintenanceRequest request, MaintenanceRequestAction action, String reason, boolean systemTransition) {
        MaintenanceRequestStatus current = MaintenanceRequestStatus.from(request.getStatus());
        return switch (action) {
            case ASSIGN -> assign(request, current, systemTransition);
            case START -> start(request, current, systemTransition);
            case HOLD -> hold(request, current, reason);
            case RESUME -> resume(request, current);
            case COMPLETE -> complete(request, current);
            case REQUEST_CLOSE -> requestClose(request, current);
            case CANCEL -> cancel(request, current, reason);
            case REOPEN -> reopen(request, current, reason);
        };
    }

    private void advanceToInProgressFromAssignment(MaintenanceRequest request) {
        MaintenanceRequestStatus current = MaintenanceRequestStatus.from(request.getStatus());
        if (current == MaintenanceRequestStatus.IN_PROGRESS || current == MaintenanceRequestStatus.COMPLETED) {
            return;
        }
        if (current == MaintenanceRequestStatus.OPEN) {
            transition(request, MaintenanceRequestAction.ASSIGN, null, true);
            current = MaintenanceRequestStatus.from(request.getStatus());
        }
        MaintenanceRequestAction action = current == MaintenanceRequestStatus.ON_HOLD
                ? MaintenanceRequestAction.RESUME
                : MaintenanceRequestAction.START;
        transition(request, action, null, true);
    }

    private ApprovalRequestDTO assign(MaintenanceRequest request, MaintenanceRequestStatus current, boolean systemTransition) {
        if (current == MaintenanceRequestStatus.ASSIGNED || current == MaintenanceRequestStatus.IN_PROGRESS
                || current == MaintenanceRequestStatus.ON_HOLD || current == MaintenanceRequestStatus.COMPLETED) {
            return null;
        }
        requireCurrent(current, MaintenanceRequestAction.ASSIGN, MaintenanceRequestStatus.OPEN);
        if (!systemTransition && assignmentDAO.findByRequestId(request.getId()).isEmpty()) {
            throw new InvalidOperationException("Create an assignment before moving the request to assigned");
        }
        request.setStatus(MaintenanceRequestStatus.ASSIGNED.value());
        return null;
    }

    private ApprovalRequestDTO start(MaintenanceRequest request, MaintenanceRequestStatus current, boolean systemTransition) {
        if (current == MaintenanceRequestStatus.IN_PROGRESS) {
            return null;
        }
        requireCurrent(current, MaintenanceRequestAction.START, MaintenanceRequestStatus.ASSIGNED);
        if (!systemTransition && assignmentDAO.findByRequestId(request.getId()).isEmpty()) {
            throw new InvalidOperationException("Create an assignment before starting work");
        }
        request.setStatus(MaintenanceRequestStatus.IN_PROGRESS.value());
        return null;
    }

    private ApprovalRequestDTO hold(MaintenanceRequest request, MaintenanceRequestStatus current, String reason) {
        requireReason(reason, "Hold reason is required");
        requireCurrent(current, MaintenanceRequestAction.HOLD, MaintenanceRequestStatus.IN_PROGRESS);
        request.setStatus(MaintenanceRequestStatus.ON_HOLD.value());
        return null;
    }

    private ApprovalRequestDTO resume(MaintenanceRequest request, MaintenanceRequestStatus current) {
        requireCurrent(current, MaintenanceRequestAction.RESUME, MaintenanceRequestStatus.ON_HOLD);
        request.setStatus(MaintenanceRequestStatus.IN_PROGRESS.value());
        return null;
    }

    private ApprovalRequestDTO complete(MaintenanceRequest request, MaintenanceRequestStatus current) {
        requireCurrent(current, MaintenanceRequestAction.COMPLETE, MaintenanceRequestStatus.IN_PROGRESS, MaintenanceRequestStatus.ON_HOLD);
        validateRequestCanClose(request);
        request.setStatus(MaintenanceRequestStatus.COMPLETED.value());
        return null;
    }

    private ApprovalRequestDTO requestClose(MaintenanceRequest request, MaintenanceRequestStatus current) {
        requireCurrent(current, MaintenanceRequestAction.REQUEST_CLOSE, MaintenanceRequestStatus.COMPLETED);
        boolean approvalRequired = approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.MAINTENANCE_REQUEST, ApprovalWorkflowService.CLOSE);
        if (!approvalRequired) {
            request.setStatus(MaintenanceRequestStatus.CLOSED.value());
            return null;
        }
        request.setStatus(MaintenanceRequestStatus.CLOSE_PENDING_APPROVAL.value());
        return approvalWorkflowService.createApprovalRequest(
                ApprovalWorkflowService.MAINTENANCE_REQUEST,
                ApprovalWorkflowService.CLOSE,
                request.getId(),
                request.getRequestNumber(),
                request.getSite(),
                Map.of("previousStatus", MaintenanceRequestStatus.COMPLETED.value(), "targetStatus", MaintenanceRequestStatus.CLOSED.value()),
                "Maintenance request closure pending approval"
        );
    }

    private ApprovalRequestDTO cancel(MaintenanceRequest request, MaintenanceRequestStatus current, String reason) {
        requireReason(reason, "Cancellation reason is required");
        requireCurrent(current, MaintenanceRequestAction.CANCEL,
                MaintenanceRequestStatus.OPEN,
                MaintenanceRequestStatus.ASSIGNED,
                MaintenanceRequestStatus.IN_PROGRESS,
                MaintenanceRequestStatus.ON_HOLD);
        boolean hasCompletedAssignment = assignmentDAO.findByRequestId(request.getId()).stream()
                .anyMatch((assignment) -> MaintenanceRequestStatus.COMPLETED.value().equalsIgnoreCase(assignment.getStatus()));
        if (hasCompletedAssignment) {
            throw new InvalidOperationException("Requests with completed assignments cannot be cancelled");
        }
        request.setStatus(MaintenanceRequestStatus.CANCELLED.value());
        return null;
    }

    private ApprovalRequestDTO reopen(MaintenanceRequest request, MaintenanceRequestStatus current, String reason) {
        requireReason(reason, "Reopen reason is required");
        requireCurrent(current, MaintenanceRequestAction.REOPEN, MaintenanceRequestStatus.CANCELLED);
        request.setStatus(MaintenanceRequestStatus.OPEN.value());
        return null;
    }

    private void requireCurrent(MaintenanceRequestStatus current, MaintenanceRequestAction action, MaintenanceRequestStatus... allowed) {
        for (MaintenanceRequestStatus status : allowed) {
            if (current == status) {
                return;
            }
        }
        throw new InvalidOperationException("Cannot " + action.name().toLowerCase().replace('_', ' ')
                + " request while status is " + current.value());
    }

    private void requireReason(String reason, String message) {
        if (reason == null || reason.isBlank()) {
            throw new InvalidOperationException(message);
        }
    }

    private void applyApproval(MaintenanceRequestDTO dto, ApprovalRequestDTO approval) {
        if (approval == null) {
            return;
        }
        dto.setApprovalRequestId(approval.getId());
        dto.setApprovalStatus(approval.getApprovalStatus());
    }
}
