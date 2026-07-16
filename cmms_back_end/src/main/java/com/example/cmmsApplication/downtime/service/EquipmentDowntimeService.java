package com.example.cmmsApplication.downtime.service;

import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.downtime.dao.EquipmentDowntimeDAO;
import com.example.cmmsApplication.downtime.dto.DowntimeRcaActionDTO;
import com.example.cmmsApplication.downtime.dto.DowntimeStatusHistoryDTO;
import com.example.cmmsApplication.downtime.dto.DowntimeTransitionDTO;
import com.example.cmmsApplication.downtime.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.downtime.entity.DowntimeRcaAction;
import com.example.cmmsApplication.downtime.entity.DowntimeStatusHistory;
import com.example.cmmsApplication.downtime.entity.EquipmentDowntime;
import com.example.cmmsApplication.downtime.repository.DowntimeRcaActionRepository;
import com.example.cmmsApplication.downtime.repository.DowntimeStatusHistoryRepository;
import com.example.cmmsApplication.employee.dao.EmployeeDAO;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.service.EquipmentService;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.maintenancerequest.service.MaintenanceRequestService;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentDowntimeService {
    private static final Set<String> STATUSES = Set.of(
            "OPEN", "CONFIRMED", "UNDER_MAINTENANCE", "RESTORED", "VERIFIED", "CLOSED", "REOPENED", "CANCELLED"
    );
    private static final Set<String> REASON_CATEGORIES = Set.of(
            "MECHANICAL", "ELECTRICAL", "INSTRUMENTATION", "UTILITY_FAILURE", "MATERIAL_SHORTAGE",
            "OPERATOR_ERROR", "PLANNED_SHUTDOWN", "CHANGEOVER", "SAFETY_STOP", "OTHER"
    );
    private static final Set<String> RCA_ACTION_TYPES = Set.of("CORRECTIVE", "PREVENTIVE");
    private static final Set<String> RCA_STATUSES = Set.of("OPEN", "IN_PROGRESS", "COMPLETED", "VERIFIED", "CANCELLED");
    private static final BigDecimal MAJOR_LOSS_AMOUNT = BigDecimal.valueOf(50000);

    private final EquipmentDowntimeDAO downtimeDAO;
    private final EquipmentService equipmentService;
    private final MaintenanceRequestService requestService;
    private final SiteService siteService;
    private final AccessControlService accessControlService;
    private final EmployeeDAO employeeDAO;
    private final DowntimeStatusHistoryRepository historyRepository;
    private final DowntimeRcaActionRepository rcaActionRepository;

    public EquipmentDowntimeDTO create(EquipmentDowntimeDTO dto) {
        accessControlService.validateSiteAccess(dto.getSiteId());
        EquipmentDowntime downtime = new EquipmentDowntime();
        downtime.setStatus("OPEN");
        apply(downtime, dto, true);
        validateNoOverlap(downtime);
        EquipmentDowntime saved = downtimeDAO.save(downtime);
        recordHistory(saved, null, saved.getStatus(), "CREATE", "Downtime opened");
        return toDTO(saved);
    }

    public EquipmentDowntimeDTO update(Long id, EquipmentDowntimeDTO dto) {
        EquipmentDowntime downtime = getEntity(id);
        validateEditable(downtime);
        accessControlService.validateSiteAccess(downtime.getSite() == null ? null : downtime.getSite().getId());
        accessControlService.validateSiteAccess(dto.getSiteId());
        apply(downtime, dto, false);
        validateNoOverlap(downtime);
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO confirm(Long id, DowntimeTransitionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        transition(downtime, "CONFIRMED", Set.of("OPEN", "REOPENED"), "CONFIRM", dto == null ? null : dto.getComment());
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO startMaintenance(Long id, DowntimeTransitionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        transition(downtime, "UNDER_MAINTENANCE", Set.of("OPEN", "CONFIRMED", "REOPENED"), "START_MAINTENANCE", dto == null ? null : dto.getComment());
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO restore(Long id, DowntimeTransitionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        if (dto != null && dto.getDowntimeEnd() != null) {
            if (!dto.getDowntimeEnd().isAfter(downtime.getDowntimeStart())) {
                throw new InvalidOperationException("Downtime end must be after downtime start");
            }
            downtime.setDowntimeEnd(dto.getDowntimeEnd());
        } else if (downtime.getDowntimeEnd() == null) {
            downtime.setDowntimeEnd(LocalDateTime.now());
        }
        if (dto != null && !isBlank(dto.getRootCause())) {
            downtime.setRootCause(dto.getRootCause().trim());
        }
        transition(downtime, "RESTORED", Set.of("OPEN", "CONFIRMED", "UNDER_MAINTENANCE", "REOPENED"), "RESTORE", dto == null ? null : dto.getComment());
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO verify(Long id, DowntimeTransitionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        if (downtime.getDowntimeEnd() == null) {
            throw new InvalidOperationException("Set downtime end before verification");
        }
        downtime.setVerifiedBy(accessControlService.getCurrentUser());
        downtime.setVerifiedAt(LocalDateTime.now());
        transition(downtime, "VERIFIED", Set.of("RESTORED"), "VERIFY", dto == null ? null : dto.getComment());
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO close(Long id, DowntimeTransitionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        if (!"VERIFIED".equalsIgnoreCase(downtime.getStatus())) {
            throw new InvalidOperationException("Downtime must be verified before closing");
        }
        if (downtime.getDowntimeEnd() == null) {
            throw new InvalidOperationException("Downtime end is required before closing");
        }
        if (dto != null && !isBlank(dto.getRootCause())) {
            downtime.setRootCause(dto.getRootCause().trim());
        }
        if (isMajorDowntime(downtime)) {
            if (isBlank(downtime.getRootCause())) {
                throw new InvalidOperationException("Root cause is required before closing major downtime");
            }
            if (rcaActionRepository.countByDowntimeId(downtime.getId()) == 0) {
                throw new InvalidOperationException("At least one RCA action is required before closing major downtime");
            }
        }
        downtime.setClosureRemarks(dto == null ? downtime.getClosureRemarks() : trimToNull(dto.getClosureRemarks()));
        downtime.setClosedAt(LocalDateTime.now());
        transition(downtime, "CLOSED", Set.of("VERIFIED"), "CLOSE", dto == null ? null : dto.getComment());
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO reopen(Long id, DowntimeTransitionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        downtime.setClosedAt(null);
        transition(downtime, "REOPENED", Set.of("CLOSED", "VERIFIED"), "REOPEN", dto == null ? null : dto.getComment());
        return toDTO(downtimeDAO.save(downtime));
    }

    @Transactional(readOnly = true)
    public EquipmentDowntimeDTO getById(Long id) {
        return toDTO(getAuthorizedEntity(id));
    }

    @Transactional(readOnly = true)
    public List<EquipmentDowntimeDTO> getAll(Long siteId, Long equipmentId) {
        List<EquipmentDowntime> entries;
        if (siteId != null && equipmentId != null) {
            accessControlService.validateSiteAccess(siteId);
            entries = downtimeDAO.findBySiteIdAndEquipmentId(siteId, equipmentId);
        } else if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
            entries = downtimeDAO.findBySiteId(siteId);
        } else if (equipmentId != null) {
            entries = accessControlService.isAdmin()
                    ? downtimeDAO.findByEquipmentId(equipmentId)
                    : downtimeDAO.findBySiteIdsAndEquipmentId(accessControlService.getAllowedSiteIds(), equipmentId);
        } else {
            entries = accessControlService.isAdmin() ? downtimeDAO.findAll() : downtimeDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        }
        return entries.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EquipmentDowntimeDTO> getByEquipmentId(Long equipmentId) {
        equipmentService.getEntity(equipmentId);
        return downtimeDAO.findByEquipmentId(equipmentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DowntimeStatusHistoryDTO> getTimeline(Long id) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        return historyRepository.findByDowntimeIdOrderByChangedAtDescIdDesc(downtime.getId()).stream()
                .map(this::toHistoryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DowntimeRcaActionDTO> getRcaActions(Long id) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        return rcaActionRepository.findByDowntimeIdOrderByCreatedAtDescIdDesc(downtime.getId()).stream()
                .map(this::toRcaActionDTO)
                .collect(Collectors.toList());
    }

    public DowntimeRcaActionDTO addRcaAction(Long id, DowntimeRcaActionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        if ("CLOSED".equalsIgnoreCase(downtime.getStatus()) || "CANCELLED".equalsIgnoreCase(downtime.getStatus())) {
            throw new InvalidOperationException("RCA actions cannot be added after downtime is closed or cancelled");
        }
        DowntimeRcaAction action = new DowntimeRcaAction();
        action.setDowntime(downtime);
        applyRcaAction(action, dto);
        DowntimeRcaAction saved = rcaActionRepository.save(action);
        recordHistory(downtime, downtime.getStatus(), downtime.getStatus(), "RCA_ACTION_ADD", action.getActionType() + ": " + action.getDescription());
        return toRcaActionDTO(saved);
    }

    public DowntimeRcaActionDTO updateRcaAction(Long id, Long actionId, DowntimeRcaActionDTO dto) {
        EquipmentDowntime downtime = getAuthorizedEntity(id);
        DowntimeRcaAction action = rcaActionRepository.findByIdAndDowntimeId(actionId, downtime.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Downtime RCA action not found with id: " + actionId));
        applyRcaAction(action, dto);
        DowntimeRcaAction saved = rcaActionRepository.save(action);
        recordHistory(downtime, downtime.getStatus(), downtime.getStatus(), "RCA_ACTION_UPDATE", action.getActionType() + ": " + action.getStatus());
        return toRcaActionDTO(saved);
    }

    public void delete(Long id) {
        EquipmentDowntime downtime = getEntity(id);
        accessControlService.validateSiteAccess(downtime.getSite() == null ? null : downtime.getSite().getId());
        if ("CLOSED".equalsIgnoreCase(downtime.getStatus())) {
            throw new InvalidOperationException("Closed downtime cannot be deleted");
        }
        downtimeDAO.deleteById(id);
    }

    private EquipmentDowntime getAuthorizedEntity(Long id) {
        EquipmentDowntime downtime = getEntity(id);
        accessControlService.validateSiteAccess(downtime.getSite() == null ? null : downtime.getSite().getId());
        return downtime;
    }

    private EquipmentDowntime getEntity(Long id) {
        return downtimeDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment downtime not found with id: " + id));
    }

    private void apply(EquipmentDowntime downtime, EquipmentDowntimeDTO dto, boolean create) {
        if (dto.getDowntimeStart() != null && dto.getDowntimeEnd() != null && !dto.getDowntimeEnd().isAfter(dto.getDowntimeStart())) {
            throw new InvalidOperationException("Downtime end must be after downtime start");
        }
        Site site = validateActiveSite(dto.getSiteId());
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        equipmentService.validateCanReceiveWork(equipment);
        if (equipment.getSite() == null || !site.getId().equals(equipment.getSite().getId())) {
            throw new InvalidOperationException("Selected equipment does not belong to selected site");
        }
        downtime.setSite(site);
        downtime.setEquipment(equipment);
        MaintenanceRequest request = dto.getRequestId() == null ? null : requestService.getEntity(dto.getRequestId());
        if (request != null) {
            requestService.validateWorkAllowed(request);
        }
        if (request != null && (request.getSite() == null || !site.getId().equals(request.getSite().getId()))) {
            throw new InvalidOperationException("Selected request does not belong to selected site");
        }
        if (request != null && (request.getEquipment() == null || !equipment.getId().equals(request.getEquipment().getId()))) {
            throw new InvalidOperationException("Selected request does not belong to selected equipment");
        }
        downtime.setRequest(request);
        downtime.setDowntimeStart(dto.getDowntimeStart());
        downtime.setDowntimeEnd(dto.getDowntimeEnd());
        if (create && !isBlank(dto.getStatus())) {
            String status = normalizeStatus(dto.getStatus());
            if (!Set.of("OPEN", "CONFIRMED").contains(status)) {
                throw new InvalidOperationException("New downtime can only start as OPEN or CONFIRMED");
            }
            downtime.setStatus(status);
        }
        downtime.setReason(trimRequired(dto.getReason(), "Reason is required"));
        downtime.setReasonCategory(normalizeOptional(dto.getReasonCategory(), REASON_CATEGORIES, "Reason category"));
        downtime.setReasonCode(trimToNull(dto.getReasonCode()));
        downtime.setRootCause(trimToNull(dto.getRootCause()));
        downtime.setProductionLine(trimToNull(dto.getProductionLine()));
        downtime.setShiftName(trimToNull(dto.getShiftName()));
        downtime.setOperatorName(trimToNull(dto.getOperatorName()));
        downtime.setExpectedOutputPerHour(nonNegative(dto.getExpectedOutputPerHour(), "Expected output per hour"));
        downtime.setLossRatePerUnit(nonNegative(dto.getLossRatePerUnit(), "Loss rate per unit"));
        downtime.setPlanned(dto.getPlanned() != null && dto.getPlanned());
        downtime.setRemarks(trimToNull(dto.getRemarks()));
        downtime.setClosureRemarks(trimToNull(dto.getClosureRemarks()));
    }

    private void applyRcaAction(DowntimeRcaAction action, DowntimeRcaActionDTO dto) {
        action.setActionType(normalizeOptionalDefault(dto.getActionType(), RCA_ACTION_TYPES, "Action type", "CORRECTIVE"));
        action.setDescription(trimRequired(dto.getDescription(), "Action description is required"));
        Employee responsible = dto.getResponsibleEmployeeId() == null ? null : employeeDAO.findById(dto.getResponsibleEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Responsible employee not found with id: " + dto.getResponsibleEmployeeId()));
        action.setResponsibleEmployee(responsible);
        action.setTargetDate(dto.getTargetDate());
        action.setStatus(normalizeOptionalDefault(dto.getStatus(), RCA_STATUSES, "RCA status", "OPEN"));
        if ("COMPLETED".equalsIgnoreCase(action.getStatus()) && action.getCompletedAt() == null) {
            action.setCompletedAt(LocalDateTime.now());
        }
        if ("VERIFIED".equalsIgnoreCase(action.getStatus())) {
            action.setCompletedAt(action.getCompletedAt() == null ? LocalDateTime.now() : action.getCompletedAt());
            action.setVerifiedBy(accessControlService.getCurrentUser());
            action.setVerifiedAt(LocalDateTime.now());
        }
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

    private void validateNoOverlap(EquipmentDowntime downtime) {
        if (downtime.getEquipment() == null || downtime.getDowntimeStart() == null) {
            return;
        }
        long overlaps = downtimeDAO.countOverlappingActiveDowntime(
                downtime.getEquipment().getId(),
                downtime.getId(),
                downtime.getDowntimeStart(),
                downtime.getDowntimeEnd()
        );
        if (overlaps > 0) {
            throw new InvalidOperationException("Selected equipment already has overlapping active downtime");
        }
    }

    private void validateEditable(EquipmentDowntime downtime) {
        if ("CLOSED".equalsIgnoreCase(downtime.getStatus()) || "CANCELLED".equalsIgnoreCase(downtime.getStatus())) {
            throw new InvalidOperationException("Closed or cancelled downtime cannot be edited directly");
        }
    }

    private void transition(EquipmentDowntime downtime, String toStatus, Set<String> allowedFrom, String action, String comment) {
        String current = normalizeStatus(downtime.getStatus());
        if (!allowedFrom.contains(current)) {
            throw new InvalidOperationException("Cannot move downtime from " + current + " to " + toStatus);
        }
        downtime.setStatus(toStatus);
        recordHistory(downtime, current, toStatus, action, comment);
    }

    private void recordHistory(EquipmentDowntime downtime, String fromStatus, String toStatus, String action, String comment) {
        DowntimeStatusHistory history = new DowntimeStatusHistory();
        history.setDowntime(downtime);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setAction(action);
        history.setComment(trimToNull(comment));
        history.setChangedBy(accessControlService.getCurrentUser());
        history.setChangedAt(LocalDateTime.now());
        historyRepository.save(history);
    }

    private boolean isMajorDowntime(EquipmentDowntime downtime) {
        Long minutes = downtime.getDowntimeMinutes();
        if (minutes != null && minutes >= 120) {
            return true;
        }
        return downtime.getLostAmount() != null && downtime.getLostAmount().compareTo(MAJOR_LOSS_AMOUNT) >= 0;
    }

    private EquipmentDowntimeDTO toDTO(EquipmentDowntime downtime) {
        EquipmentDowntimeDTO dto = new EquipmentDowntimeDTO();
        dto.setId(downtime.getId());
        dto.setEquipmentId(downtime.getEquipment().getId());
        dto.setEquipmentCode(downtime.getEquipment().getEquipmentCode());
        dto.setEquipmentName(downtime.getEquipment().getEquipmentName());
        dto.setSiteId(downtime.getSite() == null ? null : downtime.getSite().getId());
        dto.setSiteCode(downtime.getSite() == null ? null : downtime.getSite().getSiteCode());
        dto.setSiteName(downtime.getSite() == null ? null : downtime.getSite().getSiteName());
        dto.setRequestId(downtime.getRequest() == null ? null : downtime.getRequest().getId());
        dto.setRequestNumber(downtime.getRequest() == null ? null : downtime.getRequest().getRequestNumber());
        dto.setRequestTitle(downtime.getRequest() == null ? null : downtime.getRequest().getTitle());
        dto.setDowntimeStart(downtime.getDowntimeStart());
        dto.setDowntimeEnd(downtime.getDowntimeEnd());
        dto.setDowntimeMinutes(downtime.getDowntimeMinutes());
        dto.setDowntimeHours(downtime.getDowntimeHours());
        dto.setDowntimeDays(downtime.getDowntimeDays());
        dto.setStatus(downtime.getStatus());
        dto.setReason(downtime.getReason());
        dto.setReasonCategory(downtime.getReasonCategory());
        dto.setReasonCode(downtime.getReasonCode());
        dto.setRootCause(downtime.getRootCause());
        dto.setProductionLine(downtime.getProductionLine());
        dto.setShiftName(downtime.getShiftName());
        dto.setOperatorName(downtime.getOperatorName());
        dto.setExpectedOutputPerHour(downtime.getExpectedOutputPerHour());
        dto.setLossRatePerUnit(downtime.getLossRatePerUnit());
        dto.setLostQuantity(downtime.getLostQuantity());
        dto.setLostAmount(downtime.getLostAmount());
        dto.setVerifiedByUserId(downtime.getVerifiedBy() == null ? null : downtime.getVerifiedBy().getId());
        dto.setVerifiedByName(userName(downtime.getVerifiedBy()));
        dto.setVerifiedAt(downtime.getVerifiedAt());
        dto.setClosedAt(downtime.getClosedAt());
        dto.setClosureRemarks(downtime.getClosureRemarks());
        dto.setPlanned(downtime.getPlanned());
        dto.setRemarks(downtime.getRemarks());
        dto.setCreatedAt(downtime.getCreatedAt());
        dto.setUpdatedAt(downtime.getUpdatedAt());
        return dto;
    }

    private DowntimeStatusHistoryDTO toHistoryDTO(DowntimeStatusHistory history) {
        return DowntimeStatusHistoryDTO.builder()
                .id(history.getId())
                .downtimeId(history.getDowntime() == null ? null : history.getDowntime().getId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .action(history.getAction())
                .comment(history.getComment())
                .changedByUserId(history.getChangedBy() == null ? null : history.getChangedBy().getId())
                .changedByName(userName(history.getChangedBy()))
                .changedAt(history.getChangedAt())
                .build();
    }

    private DowntimeRcaActionDTO toRcaActionDTO(DowntimeRcaAction action) {
        return DowntimeRcaActionDTO.builder()
                .id(action.getId())
                .downtimeId(action.getDowntime() == null ? null : action.getDowntime().getId())
                .actionType(action.getActionType())
                .description(action.getDescription())
                .responsibleEmployeeId(action.getResponsibleEmployee() == null ? null : action.getResponsibleEmployee().getId())
                .responsibleEmployeeName(employeeName(action.getResponsibleEmployee()))
                .targetDate(action.getTargetDate())
                .status(action.getStatus())
                .completedAt(action.getCompletedAt())
                .verifiedByUserId(action.getVerifiedBy() == null ? null : action.getVerifiedBy().getId())
                .verifiedByName(userName(action.getVerifiedBy()))
                .verifiedAt(action.getVerifiedAt())
                .createdAt(action.getCreatedAt())
                .updatedAt(action.getUpdatedAt())
                .build();
    }

    private String normalizeStatus(String value) {
        String status = isBlank(value) ? "OPEN" : value.trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(status)) {
            throw new InvalidOperationException("Unsupported downtime status: " + value);
        }
        return status;
    }

    private String normalizeOptional(String value, Set<String> allowed, String label) {
        if (isBlank(value)) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(normalized)) {
            throw new InvalidOperationException(label + " is not supported: " + value);
        }
        return normalized;
    }

    private String normalizeOptionalDefault(String value, Set<String> allowed, String label, String defaultValue) {
        String normalized = isBlank(value) ? defaultValue : value.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(normalized)) {
            throw new InvalidOperationException(label + " is not supported: " + value);
        }
        return normalized;
    }

    private BigDecimal nonNegative(BigDecimal value, String label) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException(label + " cannot be negative");
        }
        return value;
    }

    private String trimRequired(String value, String message) {
        if (isBlank(value)) {
            throw new InvalidOperationException(message);
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String employeeName(Employee employee) {
        if (employee == null) {
            return null;
        }
        return (employee.getFirstName() + " " + (employee.getLastName() == null ? "" : employee.getLastName())).trim();
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
