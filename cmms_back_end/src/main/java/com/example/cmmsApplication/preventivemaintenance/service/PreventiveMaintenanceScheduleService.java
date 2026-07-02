package com.example.cmmsApplication.preventivemaintenance.service;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.approval.service.ApprovalWorkflowService;
import com.example.cmmsApplication.assignment.service.MaintenanceAssignmentChecklistService;
import com.example.cmmsApplication.common.observability.ObservabilityMetrics;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.service.EquipmentService;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.vendor.service.VendorService;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.maintenancerequest.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.preventivemaintenance.dao.PmScheduleChecklistItemDAO;
import com.example.cmmsApplication.preventivemaintenance.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.approval.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.preventivemaintenance.dto.PmScheduleChecklistItemDTO;
import com.example.cmmsApplication.preventivemaintenance.dto.PreventiveMaintenanceScheduleDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.Collections;
import java.util.Collection;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PreventiveMaintenanceScheduleService {
    private static final List<String> FREQUENCIES = Arrays.asList("DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY");
    private static final long MAX_CALENDAR_RANGE_DAYS = 370;

    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final PmScheduleChecklistItemDAO checklistItemDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final EquipmentService equipmentService;
    private final VendorService vendorService;
    private final SiteService siteService;
    private final AccessControlService accessControlService;
    private final ApprovalWorkflowService approvalWorkflowService;
    private final MaintenanceAssignmentChecklistService assignmentChecklistService;
    private final ObservabilityMetrics observabilityMetrics;
    private static final Set<String> CHECKLIST_RESPONSE_TYPES = Set.of("CHECKBOX", "TEXT", "NUMBER", "PHOTO");

public PreventiveMaintenanceScheduleDTO create(PreventiveMaintenanceScheduleDTO dto) {
        accessControlService.validateSiteAccess(dto.getSiteId());
        PreventiveMaintenanceSchedule schedule = new PreventiveMaintenanceSchedule();
        apply(schedule, dto);
        if (schedule.getScheduleCode() == null || schedule.getScheduleCode().isBlank()) {
            schedule.setScheduleCode(generateScheduleCode());
        }
        if (scheduleDAO.existsByScheduleCode(schedule.getScheduleCode())) {
            throw new InvalidOperationException("PM schedule code already exists: " + schedule.getScheduleCode());
        }
        boolean approvalRequired = approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.PM_SCHEDULE, ApprovalWorkflowService.CREATE);
        if (approvalRequired) {
            schedule.setActive(false);
            schedule.setStatus("PENDING_APPROVAL");
        }
        PreventiveMaintenanceSchedule saved = scheduleDAO.save(schedule);
        saveChecklistItems(saved, dto.getChecklistItems());
        PreventiveMaintenanceScheduleDTO result = toDTO(saved);
        if (approvalRequired) {
            ApprovalRequestDTO approval = approvalWorkflowService.createApprovalRequest(
                    ApprovalWorkflowService.PM_SCHEDULE,
                    ApprovalWorkflowService.CREATE,
                    saved.getId(),
                    saved.getScheduleCode(),
                    saved.getSite(),
                    Map.of("targetStatus", "APPROVED"),
                    "PM schedule creation pending approval"
            );
            applyApproval(result, approval);
        }
        return result;
    }

    public PreventiveMaintenanceScheduleDTO update(Long id, PreventiveMaintenanceScheduleDTO dto) {
        PreventiveMaintenanceSchedule schedule = getEntity(id);
        accessControlService.validateSiteAccess(schedule.getSite() == null ? null : schedule.getSite().getId());
        accessControlService.validateSiteAccess(dto.getSiteId());
        apply(schedule, dto);
        if (scheduleDAO.existsByScheduleCodeAndIdNot(schedule.getScheduleCode(), id)) {
            throw new InvalidOperationException("PM schedule code already exists: " + schedule.getScheduleCode());
        }
        boolean approvalRequired = approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.PM_SCHEDULE, ApprovalWorkflowService.UPDATE);
        if (approvalRequired) {
            schedule.setActive(false);
            schedule.setStatus("PENDING_APPROVAL");
        }
        PreventiveMaintenanceSchedule saved = scheduleDAO.save(schedule);
        saveChecklistItems(saved, dto.getChecklistItems());
        PreventiveMaintenanceScheduleDTO result = toDTO(saved);
        if (approvalRequired) {
            ApprovalRequestDTO approval = approvalWorkflowService.createApprovalRequest(
                    ApprovalWorkflowService.PM_SCHEDULE,
                    ApprovalWorkflowService.UPDATE,
                    saved.getId(),
                    saved.getScheduleCode(),
                    saved.getSite(),
                    Map.of("targetStatus", "APPROVED"),
                    "PM schedule update pending approval"
            );
            applyApproval(result, approval);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public PreventiveMaintenanceScheduleDTO getById(Long id) {
        PreventiveMaintenanceSchedule schedule = getEntity(id);
        accessControlService.validateSiteAccess(schedule.getSite() == null ? null : schedule.getSite().getId());
        return toDTO(schedule);
    }

    @Transactional(readOnly = true)
    public List<PreventiveMaintenanceScheduleDTO> getAll() {
        return scheduleDAO.findAll().stream()
                .filter((schedule) -> accessControlService.isAdmin()
                        || (schedule.getSite() != null && accessControlService.getAllowedSiteIds().contains(schedule.getSite().getId())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreventiveMaintenanceScheduleDTO> getUpcoming(int days) {
        LocalDate today = LocalDate.now();
        return scheduleDAO.findUpcoming(today, today.plusDays(days)).stream()
                .filter((schedule) -> accessControlService.isAdmin()
                        || (schedule.getSite() != null && accessControlService.getAllowedSiteIds().contains(schedule.getSite().getId())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreventiveMaintenanceScheduleDTO> getCalendar(LocalDate startDate, LocalDate endDate, Long siteId, Long equipmentId) {
        if (startDate == null || endDate == null) {
            throw new InvalidOperationException("Calendar startDate and endDate are required.");
        }
        if (endDate.isBefore(startDate)) {
            throw new InvalidOperationException("Calendar endDate must be on or after startDate.");
        }
        long rangeDays = Duration.between(startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay()).toDays();
        if (rangeDays > MAX_CALENDAR_RANGE_DAYS) {
            throw new InvalidOperationException("Calendar range cannot exceed " + MAX_CALENDAR_RANGE_DAYS + " days.");
        }
        boolean admin = accessControlService.isAdmin();
        Collection<Long> allowedSiteIds = admin ? Collections.singleton(-1L) : accessControlService.getAllowedSiteIds();
        if (!admin && allowedSiteIds.isEmpty()) {
            return List.of();
        }
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        return scheduleDAO.findCalendar(startDate, endDate, siteId, equipmentId, admin, allowedSiteIds).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PreventiveMaintenanceScheduleDTO> generateDueWorkOrders() {
        Instant started = Instant.now();
        try {
            List<PreventiveMaintenanceScheduleDTO> generated = scheduleDAO.findDue(LocalDate.now()).stream()
                    .map(this::generateWorkOrder)
                    .collect(Collectors.toList());
            observabilityMetrics.recordPmGeneration("success", generated.size(), Duration.between(started, Instant.now()));
            return generated;
        } catch (RuntimeException ex) {
            observabilityMetrics.recordPmGeneration("failure", 0, Duration.between(started, Instant.now()));
            throw ex;
        }
    }

    @Scheduled(cron = "0 0 6 * * *")
    public void generateDueWorkOrdersDaily() {
        Instant started = Instant.now();
        int generated = 0;
        try {
            List<PreventiveMaintenanceSchedule> dueSchedules = scheduleDAO.findDue(LocalDate.now());
            for (PreventiveMaintenanceSchedule schedule : dueSchedules) {
                generateWorkOrderNow(schedule);
                generated++;
            }
            observabilityMetrics.recordPmGeneration("success", generated, Duration.between(started, Instant.now()));
        } catch (RuntimeException ex) {
            observabilityMetrics.recordPmGeneration("failure", generated, Duration.between(started, Instant.now()));
            // Keep the scheduler from failing the application if business data blocks one run.
        }
    }

    public PreventiveMaintenanceScheduleDTO generateWorkOrder(Long id) {
        Instant started = Instant.now();
        try {
            PreventiveMaintenanceScheduleDTO result = generateWorkOrder(getEntity(id));
            observabilityMetrics.recordPmGeneration("success", 1, Duration.between(started, Instant.now()));
            return result;
        } catch (RuntimeException ex) {
            observabilityMetrics.recordPmGeneration("failure", 0, Duration.between(started, Instant.now()));
            throw ex;
        }
    }

    public void delete(Long id) {
        PreventiveMaintenanceSchedule schedule = getEntity(id);
        accessControlService.validateSiteAccess(schedule.getSite() == null ? null : schedule.getSite().getId());
        scheduleDAO.deleteById(id);
    }

    private PreventiveMaintenanceSchedule getEntity(Long id) {
        return scheduleDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PM schedule not found with id: " + id));
    }

    public PreventiveMaintenanceScheduleDTO generateWorkOrderImmediately(Long id) {
        return toDTO(generateWorkOrderNow(getEntity(id)));
    }

    private PreventiveMaintenanceScheduleDTO generateWorkOrder(PreventiveMaintenanceSchedule schedule) {
        accessControlService.validateSiteAccess(schedule.getSite() == null ? null : schedule.getSite().getId());
        if (!Boolean.TRUE.equals(schedule.getActive()) || "PENDING_APPROVAL".equalsIgnoreCase(schedule.getStatus()) || "REJECTED".equalsIgnoreCase(schedule.getStatus())) {
            throw new InvalidOperationException("PM schedule must be active and approved before work order generation");
        }
        boolean approvalRequired = approvalWorkflowService.isApprovalEnabled(ApprovalWorkflowService.PM_WORK_ORDER, ApprovalWorkflowService.GENERATE);
        if (approvalRequired) {
            schedule.setLastNotificationStatus("WORK_ORDER_GENERATION_PENDING_APPROVAL");
            PreventiveMaintenanceSchedule saved = scheduleDAO.save(schedule);
            PreventiveMaintenanceScheduleDTO result = toDTO(saved);
            ApprovalRequestDTO approval = approvalWorkflowService.createApprovalRequest(
                    ApprovalWorkflowService.PM_WORK_ORDER,
                    ApprovalWorkflowService.GENERATE,
                    saved.getId(),
                    saved.getScheduleCode(),
                    saved.getSite(),
                    Map.of("dueDate", saved.getNextDueDate() == null ? "" : saved.getNextDueDate().toString()),
                    "PM work order generation pending approval"
            );
            applyApproval(result, approval);
            return result;
        }
        return toDTO(generateWorkOrderNow(schedule));
    }

    private PreventiveMaintenanceSchedule generateWorkOrderNow(PreventiveMaintenanceSchedule schedule) {
        MaintenanceRequest request = new MaintenanceRequest();
        request.setRequestNumber(generateRequestNumber(schedule));
        request.setSite(schedule.getSite());
        request.setEquipment(schedule.getEquipment());
        request.setPmSchedule(schedule);
        request.setRequestType("PREVENTIVE");
        request.setPriority(schedule.getPriority());
        request.setStatus("OPEN");
        request.setTitle(schedule.getTitle());
        request.setDescription(schedule.getDescription());
        request.setReportedBy("PM Scheduler");
        request.setRequestedDate(schedule.getNextDueDate());
        request.setTargetCompletionDate(schedule.getNextDueDate());
        MaintenanceRequest savedRequest = requestDAO.save(request);

        if (schedule.getVendor() != null || (schedule.getAssignedTo() != null && !schedule.getAssignedTo().isBlank())) {
            MaintenanceAssignment assignment = new MaintenanceAssignment();
            assignment.setRequest(savedRequest);
            assignment.setVendor(schedule.getVendor());
            assignment.setAssignedTo(resolveAssignedTo(schedule));
            assignment.setAssignedDate(LocalDate.now());
            assignment.setPlannedStartDate(schedule.getNextDueDate());
            assignment.setPlannedEndDate(schedule.getNextDueDate());
            assignment.setStatus("ASSIGNED");
            assignment.setRemarks("Auto-generated from PM schedule " + schedule.getScheduleCode());
            MaintenanceAssignment savedAssignment = assignmentDAO.save(assignment);
            assignmentChecklistService.copyFromPmTemplate(savedAssignment, checklistItemDAO.findActiveByScheduleId(schedule.getId()));
        }

        notifyVendor(schedule, savedRequest);
        schedule.setLastGeneratedDate(schedule.getNextDueDate());
        schedule.setNextDueDate(nextDate(schedule.getNextDueDate(), schedule.getFrequency()));
        return scheduleDAO.save(schedule);
    }

    private void apply(PreventiveMaintenanceSchedule schedule, PreventiveMaintenanceScheduleDTO dto) {
        Site site = validateActiveSite(dto.getSiteId());
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        Vendor vendor = dto.getVendorId() == null ? null : vendorService.getEntity(dto.getVendorId());
        String frequency = normalizeFrequency(dto.getFrequency());

        if (equipment.getSite() == null || !site.getId().equals(equipment.getSite().getId())) {
            throw new InvalidOperationException("Selected equipment does not belong to selected site");
        }
        if (vendor != null && !vendorService.isVendorAssignedToSite(vendor.getId(), site.getId())) {
            throw new InvalidOperationException("Selected vendor is not assigned to selected site");
        }

        schedule.setSite(site);
        schedule.setEquipment(equipment);
        schedule.setVendor(vendor);
        if (dto.getScheduleCode() != null && !dto.getScheduleCode().isBlank()) {
            schedule.setScheduleCode(dto.getScheduleCode());
        }
        schedule.setTitle(dto.getTitle());
        schedule.setDescription(dto.getDescription());
        schedule.setFrequency(frequency);
        schedule.setPriority(dto.getPriority() == null ? "MEDIUM" : dto.getPriority());
        schedule.setAssignedTo(dto.getAssignedTo());
        schedule.setStartDate(dto.getStartDate());
        schedule.setNextDueDate(dto.getNextDueDate() == null ? dto.getStartDate() : dto.getNextDueDate());
        schedule.setActive(dto.getActive() == null || dto.getActive());
        schedule.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "ACTIVE" : dto.getStatus());
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

    private String normalizeFrequency(String frequency) {
        String normalized = frequency == null ? "" : frequency.trim().toUpperCase(Locale.ROOT);
        if (!FREQUENCIES.contains(normalized)) {
            throw new InvalidOperationException("Frequency must be DAILY, WEEKLY, MONTHLY, QUARTERLY, or YEARLY");
        }
        return normalized;
    }

    private LocalDate nextDate(LocalDate current, String frequency) {
        switch (frequency) {
            case "DAILY": return current.plusDays(1);
            case "WEEKLY": return current.plusWeeks(1);
            case "MONTHLY": return current.plusMonths(1);
            case "QUARTERLY": return current.plusMonths(3);
            case "YEARLY": return current.plusYears(1);
            default: throw new InvalidOperationException("Unsupported frequency: " + frequency);
        }
    }

    private String resolveAssignedTo(PreventiveMaintenanceSchedule schedule) {
        if (schedule.getAssignedTo() != null && !schedule.getAssignedTo().isBlank()) {
            return schedule.getAssignedTo();
        }
        if (schedule.getVendor() != null && schedule.getVendor().getContactPerson() != null) {
            return schedule.getVendor().getContactPerson();
        }
        return "Vendor Team";
    }

    private void notifyVendor(PreventiveMaintenanceSchedule schedule, MaintenanceRequest request) {
        if (schedule.getVendor() == null) {
            schedule.setLastNotificationStatus("NO_VENDOR_ASSIGNED");
            schedule.setLastNotificationAt(LocalDateTime.now());
            return;
        }
        String channel = schedule.getVendor().getEmail() == null || schedule.getVendor().getEmail().isBlank()
                ? "CONTACT_PENDING"
                : "EMAIL_QUEUED";
        schedule.setLastNotificationStatus(channel + " for " + request.getRequestNumber());
        schedule.setLastNotificationAt(LocalDateTime.now());
    }

    private String generateScheduleCode() {
        return "PM-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + System.currentTimeMillis();
    }

    private String generateRequestNumber(PreventiveMaintenanceSchedule schedule) {
        return "PMWO-" + schedule.getId() + "-" + schedule.getNextDueDate().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + System.currentTimeMillis();
    }

    private PreventiveMaintenanceScheduleDTO toDTO(PreventiveMaintenanceSchedule schedule) {
        long generated = requestDAO.countByPmScheduleId(schedule.getId());
        long completed = requestDAO.countCompletedByPmScheduleId(schedule.getId());
        BigDecimal completion = generated == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(completed).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(generated), 2, RoundingMode.HALF_UP);

        PreventiveMaintenanceScheduleDTO dto = new PreventiveMaintenanceScheduleDTO();
        dto.setId(schedule.getId());
        dto.setScheduleCode(schedule.getScheduleCode());
        dto.setSiteId(schedule.getSite() == null ? null : schedule.getSite().getId());
        dto.setSiteCode(schedule.getSite() == null ? null : schedule.getSite().getSiteCode());
        dto.setSiteName(schedule.getSite() == null ? null : schedule.getSite().getSiteName());
        dto.setEquipmentId(schedule.getEquipment().getId());
        dto.setEquipmentCode(schedule.getEquipment().getEquipmentCode());
        dto.setEquipmentName(schedule.getEquipment().getEquipmentName());
        dto.setVendorId(schedule.getVendor() == null ? null : schedule.getVendor().getId());
        dto.setVendorName(schedule.getVendor() == null ? null : schedule.getVendor().getVendorName());
        dto.setTitle(schedule.getTitle());
        dto.setDescription(schedule.getDescription());
        dto.setFrequency(schedule.getFrequency());
        dto.setPriority(schedule.getPriority());
        dto.setAssignedTo(schedule.getAssignedTo());
        dto.setStartDate(schedule.getStartDate());
        dto.setNextDueDate(schedule.getNextDueDate());
        dto.setLastGeneratedDate(schedule.getLastGeneratedDate());
        dto.setActive(schedule.getActive());
        dto.setStatus(schedule.getStatus());
        dto.setLastNotificationStatus(schedule.getLastNotificationStatus());
        dto.setLastNotificationAt(schedule.getLastNotificationAt());
        dto.setGeneratedWorkOrders(generated);
        dto.setCompletedWorkOrders(completed);
        dto.setCompletionPercentage(completion);
        dto.setCreatedAt(schedule.getCreatedAt());
        dto.setUpdatedAt(schedule.getUpdatedAt());
        dto.setChecklistItems(checklistDTOs(schedule.getId()));
        return dto;
    }

    private void applyApproval(PreventiveMaintenanceScheduleDTO dto, ApprovalRequestDTO approval) {
        if (approval == null) {
            return;
        }
        dto.setApprovalRequestId(approval.getId());
        dto.setApprovalStatus(approval.getApprovalStatus());
    }

    private void saveChecklistItems(PreventiveMaintenanceSchedule schedule, List<PmScheduleChecklistItemDTO> checklistItems) {
        checklistItemDAO.deleteByScheduleId(schedule.getId());
        if (checklistItems == null || checklistItems.isEmpty()) {
            return;
        }
        int fallbackSequence = 1;
        for (PmScheduleChecklistItemDTO dto : checklistItems) {
            if (dto == null || dto.getTaskTitle() == null || dto.getTaskTitle().isBlank()) {
                continue;
            }
            PmScheduleChecklistItem item = new PmScheduleChecklistItem();
            item.setSchedule(schedule);
            item.setSequenceNumber(dto.getSequenceNumber() == null ? fallbackSequence : dto.getSequenceNumber());
            item.setTaskTitle(dto.getTaskTitle().trim());
            item.setInstructions(emptyToNull(dto.getInstructions()));
            item.setRequired(dto.getRequired() == null || dto.getRequired());
            item.setProofRequired(Boolean.TRUE.equals(dto.getProofRequired()));
            item.setResponseType(normalizeChecklistResponseType(dto.getResponseType()));
            item.setActive(dto.getActive() == null || dto.getActive());
            checklistItemDAO.save(item);
            fallbackSequence++;
        }
    }

    private List<PmScheduleChecklistItemDTO> checklistDTOs(Long scheduleId) {
        return checklistItemDAO.findByScheduleId(scheduleId).stream()
                .map(this::toChecklistDTO)
                .collect(Collectors.toList());
    }

    private PmScheduleChecklistItemDTO toChecklistDTO(PmScheduleChecklistItem item) {
        return PmScheduleChecklistItemDTO.builder()
                .id(item.getId())
                .sequenceNumber(item.getSequenceNumber())
                .taskTitle(item.getTaskTitle())
                .instructions(item.getInstructions())
                .required(item.getRequired())
                .proofRequired(item.getProofRequired())
                .responseType(item.getResponseType())
                .active(item.getActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private String normalizeChecklistResponseType(String value) {
        String responseType = value == null || value.isBlank() ? "CHECKBOX" : value.trim().toUpperCase(Locale.ROOT);
        if (!CHECKLIST_RESPONSE_TYPES.contains(responseType)) {
            throw new InvalidOperationException("Checklist response type must be CHECKBOX, TEXT, NUMBER, or PHOTO");
        }
        return responseType;
    }

    private String emptyToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
}
