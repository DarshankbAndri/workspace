package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.dto.PreventiveMaintenanceScheduleDTO;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.entity.MaintenanceAssignment;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.entity.Vendor;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class PreventiveMaintenanceScheduleService {
    private static final List<String> FREQUENCIES = Arrays.asList("DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY");

    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final EquipmentService equipmentService;
    private final VendorService vendorService;
    private final SiteService siteService;

    public PreventiveMaintenanceScheduleService(
            PreventiveMaintenanceScheduleDAO scheduleDAO,
            MaintenanceRequestDAO requestDAO,
            MaintenanceAssignmentDAO assignmentDAO,
            EquipmentService equipmentService,
            VendorService vendorService,
            SiteService siteService) {
        this.scheduleDAO = scheduleDAO;
        this.requestDAO = requestDAO;
        this.assignmentDAO = assignmentDAO;
        this.equipmentService = equipmentService;
        this.vendorService = vendorService;
        this.siteService = siteService;
    }

    public PreventiveMaintenanceScheduleDTO create(PreventiveMaintenanceScheduleDTO dto) {
        PreventiveMaintenanceSchedule schedule = new PreventiveMaintenanceSchedule();
        apply(schedule, dto);
        if (schedule.getScheduleCode() == null || schedule.getScheduleCode().isBlank()) {
            schedule.setScheduleCode(generateScheduleCode());
        }
        if (scheduleDAO.existsByScheduleCode(schedule.getScheduleCode())) {
            throw new InvalidOperationException("PM schedule code already exists: " + schedule.getScheduleCode());
        }
        return toDTO(scheduleDAO.save(schedule));
    }

    public PreventiveMaintenanceScheduleDTO update(Long id, PreventiveMaintenanceScheduleDTO dto) {
        PreventiveMaintenanceSchedule schedule = getEntity(id);
        apply(schedule, dto);
        if (scheduleDAO.existsByScheduleCodeAndIdNot(schedule.getScheduleCode(), id)) {
            throw new InvalidOperationException("PM schedule code already exists: " + schedule.getScheduleCode());
        }
        return toDTO(scheduleDAO.save(schedule));
    }

    @Transactional(readOnly = true)
    public PreventiveMaintenanceScheduleDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<PreventiveMaintenanceScheduleDTO> getAll() {
        return scheduleDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreventiveMaintenanceScheduleDTO> getUpcoming(int days) {
        LocalDate today = LocalDate.now();
        return scheduleDAO.findUpcoming(today, today.plusDays(days)).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PreventiveMaintenanceScheduleDTO> generateDueWorkOrders() {
        return scheduleDAO.findDue(LocalDate.now()).stream()
                .map(this::generateWorkOrder)
                .collect(Collectors.toList());
    }

    @Scheduled(cron = "0 0 6 * * *")
    public void generateDueWorkOrdersDaily() {
        generateDueWorkOrders();
    }

    public PreventiveMaintenanceScheduleDTO generateWorkOrder(Long id) {
        return generateWorkOrder(getEntity(id));
    }

    public void delete(Long id) {
        getEntity(id);
        scheduleDAO.deleteById(id);
    }

    private PreventiveMaintenanceSchedule getEntity(Long id) {
        return scheduleDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PM schedule not found with id: " + id));
    }

    private PreventiveMaintenanceScheduleDTO generateWorkOrder(PreventiveMaintenanceSchedule schedule) {
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
            assignmentDAO.save(assignment);
        }

        notifyVendor(schedule, savedRequest);
        schedule.setLastGeneratedDate(schedule.getNextDueDate());
        schedule.setNextDueDate(nextDate(schedule.getNextDueDate(), schedule.getFrequency()));
        return toDTO(scheduleDAO.save(schedule));
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
        dto.setLastNotificationStatus(schedule.getLastNotificationStatus());
        dto.setLastNotificationAt(schedule.getLastNotificationAt());
        dto.setGeneratedWorkOrders(generated);
        dto.setCompletedWorkOrders(completed);
        dto.setCompletionPercentage(completion);
        dto.setCreatedAt(schedule.getCreatedAt());
        dto.setUpdatedAt(schedule.getUpdatedAt());
        return dto;
    }
}
