package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.ApprovalActionDAO;
import com.example.cmmsApplication.dao.ApprovalConfigDAO;
import com.example.cmmsApplication.dao.ApprovalRequestDAO;
import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.dto.ApprovalActionDTO;
import com.example.cmmsApplication.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.entity.ApprovalAction;
import com.example.cmmsApplication.entity.ApprovalConfig;
import com.example.cmmsApplication.entity.ApprovalRequest;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApprovalWorkflowService {
    public static final String PM_SCHEDULE = "PM_SCHEDULE";
    public static final String PM_WORK_ORDER = "PM_WORK_ORDER";
    public static final String MAINTENANCE_REQUEST = "MAINTENANCE_REQUEST";
    public static final String CREATE = "CREATE";
    public static final String UPDATE = "UPDATE";
    public static final String GENERATE = "GENERATE";
    public static final String CLOSE = "CLOSE";

    private final boolean globalApprovalEnabled;
    private final ApprovalConfigDAO approvalConfigDAO;
    private final ApprovalRequestDAO approvalRequestDAO;
    private final ApprovalActionDAO approvalActionDAO;
    private final MaintenanceRequestDAO maintenanceRequestDAO;
    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final AccessControlService accessControlService;
    private final ObjectProvider<PreventiveMaintenanceScheduleService> scheduleServiceProvider;
    private final ObjectMapper objectMapper;

    public ApprovalWorkflowService(@Value("${cmms.approval.enabled:false}") boolean globalApprovalEnabled,
                                   ApprovalConfigDAO approvalConfigDAO,
                                   ApprovalRequestDAO approvalRequestDAO,
                                   ApprovalActionDAO approvalActionDAO,
                                   MaintenanceRequestDAO maintenanceRequestDAO,
                                   PreventiveMaintenanceScheduleDAO scheduleDAO,
                                   AccessControlService accessControlService,
                                   ObjectProvider<PreventiveMaintenanceScheduleService> scheduleServiceProvider,
                                   ObjectMapper objectMapper) {
        this.globalApprovalEnabled = globalApprovalEnabled;
        this.approvalConfigDAO = approvalConfigDAO;
        this.approvalRequestDAO = approvalRequestDAO;
        this.approvalActionDAO = approvalActionDAO;
        this.maintenanceRequestDAO = maintenanceRequestDAO;
        this.scheduleDAO = scheduleDAO;
        this.accessControlService = accessControlService;
        this.scheduleServiceProvider = scheduleServiceProvider;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public boolean isApprovalEnabled(String moduleCode, String actionCode) {
        if (!globalApprovalEnabled) {
            return false;
        }
        return approvalConfigDAO.findActive(normalize(moduleCode), normalize(actionCode))
                .map((config) -> Boolean.TRUE.equals(config.getApprovalRequired()))
                .orElse(false);
    }

    public ApprovalRequestDTO createApprovalRequest(String moduleCode,
                                                    String actionCode,
                                                    Long referenceId,
                                                    String referenceCode,
                                                    Site site,
                                                    Object payload,
                                                    String remarks) {
        ApprovalConfig config = approvalConfigDAO.findActive(normalize(moduleCode), normalize(actionCode))
                .orElseThrow(() -> new InvalidOperationException("Approval config not found for " + moduleCode + " / " + actionCode));
        if (!Boolean.TRUE.equals(config.getApprovalRequired())) {
            return null;
        }
        accessControlService.validateSiteAccess(site == null ? null : site.getId());
        ApprovalRequest request = new ApprovalRequest();
        request.setModuleCode(config.getModuleCode());
        request.setActionCode(config.getActionCode());
        request.setReferenceId(referenceId);
        request.setReferenceCode(referenceCode);
        request.setSite(site);
        request.setRequestedBy(accessControlService.getCurrentUser());
        request.setApproverRoleCode(config.getApproverRoleCode());
        request.setMinApprovalCount(config.getMinApprovalCount() == null || config.getMinApprovalCount() < 1 ? 1 : config.getMinApprovalCount());
        request.setRemarks(remarks);
        request.setPayloadJson(toJson(payload));
        return toDTO(approvalRequestDAO.save(request), true);
    }

    public ApprovalRequestDTO approve(Long approvalRequestId, String comments) {
        accessControlService.validatePermission("APPROVAL_APPROVE");
        ApprovalRequest request = getPendingRequest(approvalRequestId);
        validateApproverPermission(request, "APPROVAL_APPROVE");
        saveAction(request, "APPROVED", comments);
        request.setApprovedCount((int) approvalActionDAO.countByApprovalRequestIdAndActionStatus(request.getId(), "APPROVED"));
        if (request.getApprovedCount() >= request.getMinApprovalCount()) {
            request.setApprovalStatus("APPROVED");
            applyApprovedBusinessAction(request);
        }
        return toDTO(approvalRequestDAO.save(request), true);
    }

    public ApprovalRequestDTO reject(Long approvalRequestId, String comments) {
        accessControlService.validatePermission("APPROVAL_REJECT");
        ApprovalRequest request = getPendingRequest(approvalRequestId);
        validateApproverPermission(request, "APPROVAL_REJECT");
        saveAction(request, "REJECTED", comments);
        request.setRejectedCount((int) approvalActionDAO.countByApprovalRequestIdAndActionStatus(request.getId(), "REJECTED"));
        request.setApprovalStatus("REJECTED");
        applyRejectedBusinessAction(request);
        return toDTO(approvalRequestDAO.save(request), true);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestDTO> getPendingApprovalsForCurrentUser() {
        accessControlService.validatePermission("APPROVAL_VIEW");
        List<ApprovalRequest> requests = accessControlService.isAdmin()
                ? approvalRequestDAO.findPending()
                : approvalRequestDAO.findPendingBySiteIds(accessControlService.getAllowedSiteIds());
        return requests.stream()
                .filter(this::canCurrentUserActOnRole)
                .map((request) -> toDTO(request, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestDTO> getApprovalHistory(String moduleCode, Long referenceId) {
        accessControlService.validatePermission("APPROVAL_VIEW");
        if (moduleCode == null || moduleCode.isBlank() || referenceId == null) {
            throw new InvalidOperationException("Module code and reference id are required");
        }
        List<ApprovalRequest> requests = accessControlService.isAdmin()
                ? approvalRequestDAO.findHistory(normalize(moduleCode), referenceId)
                : approvalRequestDAO.findHistoryBySiteIds(accessControlService.getAllowedSiteIds(), normalize(moduleCode), referenceId);
        requests.forEach((request) -> accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId()));
        return requests.stream().map((request) -> toDTO(request, true)).collect(Collectors.toList());
    }

    public void validateApproverPermission(ApprovalRequest request, String permissionCode) {
        accessControlService.validatePermission(permissionCode);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        if (!canCurrentUserActOnRole(request)) {
            throw new InvalidOperationException("Current user is not an approver for this request");
        }
    }

    private ApprovalRequest getPendingRequest(Long approvalRequestId) {
        ApprovalRequest request = approvalRequestDAO.findById(approvalRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request not found with id: " + approvalRequestId));
        if (!"PENDING".equalsIgnoreCase(request.getApprovalStatus())) {
            throw new InvalidOperationException("Approval request is not pending");
        }
        return request;
    }

    private void saveAction(ApprovalRequest request, String status, String comments) {
        User currentUser = accessControlService.getCurrentUser();
        if (approvalActionDAO.existsByApprovalRequestIdAndApproverUserId(request.getId(), currentUser.getId())) {
            throw new InvalidOperationException("You have already acted on this approval request");
        }
        ApprovalAction action = new ApprovalAction();
        action.setApprovalRequest(request);
        action.setApproverUser(currentUser);
        action.setActionStatus(status);
        action.setComments(comments);
        approvalActionDAO.save(action);
    }

    private boolean canCurrentUserActOnRole(ApprovalRequest request) {
        if (accessControlService.isAdmin()) {
            return true;
        }
        String approverRoleCode = request.getApproverRoleCode();
        if (approverRoleCode == null || approverRoleCode.isBlank()) {
            return true;
        }
        Set<String> roles = accessControlService.getRoles();
        return roles.contains(approverRoleCode);
    }

    private void applyApprovedBusinessAction(ApprovalRequest request) {
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CREATE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus("OPEN");
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CLOSE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus("CLOSED");
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (PM_SCHEDULE.equals(request.getModuleCode()) && (CREATE.equals(request.getActionCode()) || UPDATE.equals(request.getActionCode()))) {
            PreventiveMaintenanceSchedule schedule = getSchedule(request.getReferenceId());
            schedule.setStatus("APPROVED");
            schedule.setActive(true);
            scheduleDAO.save(schedule);
            return;
        }
        if (PM_WORK_ORDER.equals(request.getModuleCode()) && GENERATE.equals(request.getActionCode())) {
            scheduleServiceProvider.getObject().generateWorkOrderImmediately(request.getReferenceId());
        }
    }

    private void applyRejectedBusinessAction(ApprovalRequest request) {
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CREATE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus("REJECTED");
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CLOSE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus(previousStatus(request.getPayloadJson(), "IN_PROGRESS"));
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (PM_SCHEDULE.equals(request.getModuleCode()) && (CREATE.equals(request.getActionCode()) || UPDATE.equals(request.getActionCode()))) {
            PreventiveMaintenanceSchedule schedule = getSchedule(request.getReferenceId());
            schedule.setStatus("REJECTED");
            schedule.setActive(false);
            scheduleDAO.save(schedule);
            return;
        }
        if (PM_WORK_ORDER.equals(request.getModuleCode()) && GENERATE.equals(request.getActionCode())) {
            PreventiveMaintenanceSchedule schedule = getSchedule(request.getReferenceId());
            schedule.setLastNotificationStatus("WORK_ORDER_GENERATION_REJECTED");
            scheduleDAO.save(schedule);
        }
    }

    private MaintenanceRequest getMaintenanceRequest(Long id) {
        return maintenanceRequestDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private PreventiveMaintenanceSchedule getSchedule(Long id) {
        return scheduleDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PM schedule not found with id: " + id));
    }

    private String previousStatus(String payloadJson, String fallback) {
        try {
            JsonNode node = objectMapper.readTree(payloadJson);
            String previous = node.path("previousStatus").asText(null);
            return previous == null || previous.isBlank() ? fallback : previous;
        } catch (Exception ex) {
            return fallback;
        }
    }

    private String toJson(Object payload) {
        try {
            Object effectivePayload = payload == null ? Map.of() : payload;
            return objectMapper.writeValueAsString(effectivePayload);
        } catch (Exception ex) {
            throw new InvalidOperationException("Unable to serialize approval payload");
        }
    }

    private ApprovalRequestDTO toDTO(ApprovalRequest request, boolean includeActions) {
        ApprovalRequestDTO dto = new ApprovalRequestDTO();
        dto.setId(request.getId());
        dto.setModuleCode(request.getModuleCode());
        dto.setActionCode(request.getActionCode());
        dto.setReferenceId(request.getReferenceId());
        dto.setReferenceCode(request.getReferenceCode());
        dto.setSiteId(request.getSite() == null ? null : request.getSite().getId());
        dto.setSiteName(request.getSite() == null ? null : request.getSite().getSiteName());
        dto.setRequestedById(request.getRequestedBy() == null ? null : request.getRequestedBy().getId());
        dto.setRequestedByName(userName(request.getRequestedBy()));
        dto.setRequestedAt(request.getRequestedAt());
        dto.setApprovalStatus(request.getApprovalStatus());
        dto.setApproverRoleCode(request.getApproverRoleCode());
        dto.setMinApprovalCount(request.getMinApprovalCount());
        dto.setApprovedCount(request.getApprovedCount());
        dto.setRejectedCount(request.getRejectedCount());
        dto.setRemarks(request.getRemarks());
        dto.setPayloadJson(request.getPayloadJson());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        if (includeActions) {
            dto.setActions(approvalActionDAO.findByApprovalRequestId(request.getId()).stream()
                    .map(this::toActionDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ApprovalActionDTO toActionDTO(ApprovalAction action) {
        ApprovalActionDTO dto = new ApprovalActionDTO();
        dto.setId(action.getId());
        dto.setApprovalRequestId(action.getApprovalRequest() == null ? null : action.getApprovalRequest().getId());
        dto.setApproverUserId(action.getApproverUser() == null ? null : action.getApproverUser().getId());
        dto.setApproverName(userName(action.getApproverUser()));
        dto.setActionStatus(action.getActionStatus());
        dto.setComments(action.getComments());
        dto.setActionAt(action.getActionAt());
        return dto;
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toUpperCase(Locale.ROOT);
    }
}
