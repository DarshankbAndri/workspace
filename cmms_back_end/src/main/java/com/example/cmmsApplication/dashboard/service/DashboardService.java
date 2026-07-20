package com.example.cmmsApplication.dashboard.service;


import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.common.exception.UnauthorizedAccessException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.preventivemaintenance.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.equipment.dao.EquipmentDAO;
import com.example.cmmsApplication.downtime.dao.EquipmentDowntimeDAO;
import com.example.cmmsApplication.downtime.entity.EquipmentDowntime;
import com.example.cmmsApplication.maintenancerequest.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.spareparts.dao.SparePartSiteStockDAO;
import com.example.cmmsApplication.vendor.dao.VendorDAO;
import com.example.cmmsApplication.dashboard.dto.DashboardActionDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardDepartmentDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardMeDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardOverviewDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardWidgetDefinitionDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardWidgetResponseDTO;
import com.example.cmmsApplication.vendoramc.service.VendorAmcService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {
    private final EquipmentDAO equipmentDAO;
    private final VendorDAO vendorDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final EquipmentDowntimeDAO downtimeDAO;
    private final SparePartSiteStockDAO stockDAO;
    private final AccessControlService accessControlService;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final VendorAmcService vendorAmcService;

    private static final String WIDGET_OVERVIEW_KPI_SUMMARY = "DASHBOARD_WIDGET_OVERVIEW_KPI_SUMMARY";
    private static final String WIDGET_EQUIPMENT_STATUS = "DASHBOARD_WIDGET_EQUIPMENT_STATUS";
    private static final String WIDGET_REPORT_DOWNTIME_SUMMARY = "DASHBOARD_WIDGET_REPORT_DOWNTIME_SUMMARY";
    private static final String WIDGET_VENDOR_PERFORMANCE = "DASHBOARD_WIDGET_VENDOR_PERFORMANCE";
    private static final String WIDGET_MAINTENANCE_PM_DUE = "DASHBOARD_WIDGET_MAINTENANCE_PM_DUE";
    private static final String WIDGET_VENDOR_AMC_ACTIVE = "DASHBOARD_WIDGET_VENDOR_AMC_ACTIVE";

    private static final List<String> OVERVIEW_PERMISSIONS = List.of(
            "EQUIPMENT_VIEW", "VENDOR_VIEW", "REQUEST_VIEW", "ASSIGNMENT_VIEW", "SPARE_PART_VIEW",
            "APPROVAL_VIEW", "VENDOR_AMC_VIEW", "DOWNTIME_VIEW", "PM_CALENDAR_VIEW"
    );

    public DashboardDTO getSummary(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        if (siteId == null && !accessControlService.isAdmin()) {
            return getAllowedSitesSummary();
        }
        Long downtimeMinutes = siteId == null ? downtimeDAO.sumDowntimeMinutes() : downtimeDAO.sumDowntimeMinutesBySiteId(siteId);
        BigDecimal downtimeHours = BigDecimal.valueOf(downtimeMinutes == null ? 0 : downtimeMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return new DashboardDTO(
                siteId == null ? equipmentDAO.count() : equipmentDAO.countBySiteId(siteId),
                siteId == null ? vendorDAO.countActive() : vendorDAO.findBySiteIdAndActive(siteId, true).size(),
                siteId == null ? requestDAO.countOpenRequests() : requestDAO.countOpenRequestsBySiteId(siteId),
                siteId == null ? stockDAO.countLowStock() : stockDAO.countLowStockBySiteId(siteId),
                downtimeHours
        );
    }

    private DashboardDTO getAllowedSitesSummary() {
        java.util.List<Long> siteIds = accessControlService.getAllowedSiteIds();
        long equipmentCount = siteIds.stream().mapToLong(equipmentDAO::countBySiteId).sum();
        long openRequests = siteIds.stream().mapToLong(requestDAO::countOpenRequestsBySiteId).sum();
        long downtimeMinutes = siteIds.stream()
                .map(downtimeDAO::sumDowntimeMinutesBySiteId)
                .filter(java.util.Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();
        BigDecimal downtimeHours = BigDecimal.valueOf(downtimeMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return new DashboardDTO(equipmentCount, vendorDAO.findBySiteIdsAndActive(siteIds, true).size(), openRequests, stockDAO.countLowStockBySiteIds(siteIds), downtimeHours);
    }

    public DashboardOverviewDTO getOverview(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        Collection<Long> allowedSiteIds = resolveAllowedSiteIds(siteId);
        return DashboardOverviewDTO.builder()
                .summary(getSummary(siteId))
                .equipmentStatus(getEquipmentStatus(allowedSiteIds))
                .monthlyDowntime(getMonthlyDowntime(allowedSiteIds))
                .vendorPerformance(getVendorPerformance(allowedSiteIds))
                .upcomingMaintenance(getUpcomingMaintenance(allowedSiteIds))
                .build();
    }

    public DashboardMeDTO getDashboardMetadata() {
        List<DashboardDepartmentDTO> departments = new ArrayList<>();
        addDepartment(departments, "OVERVIEW", "Overview", List.of(
                widget(WIDGET_OVERVIEW_KPI_SUMMARY, "OVERVIEW", "KPI Summary", "KPI", "/api/dashboard/widgets/overview/kpi-summary", 60, "/dashboard", "large",
                        List.of(), OVERVIEW_PERMISSIONS, List.of())
        ));
        addDepartment(departments, "EQUIPMENT", "Equipment", List.of(
                widget(WIDGET_EQUIPMENT_STATUS, "EQUIPMENT", "Equipment Status", "CHART", "/api/dashboard/widgets/equipment/status", 120, "/equipment", "medium",
                        List.of("EQUIPMENT_VIEW"), List.of(), List.of(action("EQUIPMENT_VIEW", "Open Equipment", "/equipment")))
        ));
        addDepartment(departments, "MAINTENANCE", "Maintenance", List.of(
                widget(WIDGET_MAINTENANCE_PM_DUE, "MAINTENANCE", "PM Due This Month", "LIST", "/api/dashboard/widgets/maintenance/pm-due", 300, "/maintenance/preventive", "medium",
                        List.of(), List.of("PM_CALENDAR_VIEW", "REQUEST_VIEW"), List.of(action("REQUEST_CREATE", "Create Request", "/maintenance/requests/new")))
        ));
        addDepartment(departments, "VENDOR_AMC", "AMC / Vendor", List.of(
                widget(WIDGET_VENDOR_PERFORMANCE, "VENDOR_AMC", "Vendor Performance", "CHART", "/api/dashboard/widgets/vendor-amc/performance", 300, "/vendors", "large",
                        List.of("VENDOR_VIEW", "ASSIGNMENT_VIEW"), List.of(), List.of(action("VENDOR_VIEW", "Open Vendors", "/vendors"))),
                widget(WIDGET_VENDOR_AMC_ACTIVE, "VENDOR_AMC", "Active AMC Contracts", "KPI", "/api/dashboard/widgets/vendor-amc/active-contracts", 300, "/vendor-amc", "medium",
                        List.of("VENDOR_AMC_VIEW"), List.of(), List.of(
                                action("VENDOR_AMC_CREATE", "Create AMC", "/vendor-amc/new"),
                                action("VENDOR_AMC_RENEW", "Renew AMC", "/vendor-amc")
                        ))
        ));
        addDepartment(departments, "REPORTS", "Reports", List.of(
                widget(WIDGET_REPORT_DOWNTIME_SUMMARY, "REPORTS", "Downtime Summary", "CHART", "/api/dashboard/widgets/reports/downtime-summary", 300, "/reports", "large",
                        List.of("REPORT_VIEW", "DOWNTIME_VIEW"), List.of(), List.of(action("REPORT_VIEW", "Open Reports", "/reports")))
        ));

        return DashboardMeDTO.builder()
                .defaultDepartment(defaultDepartment(departments))
                .permissions(accessControlService.getPermissions())
                .allowedSites(accessControlService.getAllowedSites())
                .departments(departments)
                .quickActions(visibleActions(List.of(
                        action("REQUEST_CREATE", "Create Request", "/maintenance/requests/new"),
                        action("ASSIGNMENT_CREATE", "Create Assignment", "/maintenance/assignments/new"),
                        action("SPARE_PART_CREATE", "Create Spare Part", "/spare-parts/new"),
                        action("VENDOR_AMC_CREATE", "Create AMC", "/vendor-amc/new"),
                        action("ROLE_CREATE", "Create Role", "/admin/roles/new")
                )))
                .generatedAt(LocalDateTime.now())
                .refreshAfterSeconds(60)
                .build();
    }

    public DashboardWidgetResponseDTO getKpiSummaryWidget(Long siteId) {
        assertAnyPermission(OVERVIEW_PERMISSIONS);
        return widgetResponse(WIDGET_OVERVIEW_KPI_SUMMARY, "OVERVIEW", "KPI Summary", "KPI", getPermissionAwareSummary(siteId), "/dashboard", 60,
                List.of());
    }

    public DashboardWidgetResponseDTO getEquipmentStatusWidget(Long siteId) {
        assertAllPermissions(List.of("EQUIPMENT_VIEW"));
        Collection<Long> siteIds = resolveAllowedSiteIdsWithValidation(siteId);
        return widgetResponse(WIDGET_EQUIPMENT_STATUS, "EQUIPMENT", "Equipment Status", "CHART", getEquipmentStatus(siteIds), "/equipment", 120,
                List.of(action("EQUIPMENT_VIEW", "Open Equipment", "/equipment")));
    }

    public DashboardWidgetResponseDTO getDowntimeSummaryWidget(Long siteId) {
        assertAllPermissions(List.of("REPORT_VIEW", "DOWNTIME_VIEW"));
        Collection<Long> siteIds = resolveAllowedSiteIdsWithValidation(siteId);
        return widgetResponse(WIDGET_REPORT_DOWNTIME_SUMMARY, "REPORTS", "Downtime Summary", "CHART", getMonthlyDowntime(siteIds), "/reports", 300,
                List.of(action("REPORT_VIEW", "Open Reports", "/reports")));
    }

    public DashboardWidgetResponseDTO getVendorPerformanceWidget(Long siteId) {
        assertAllPermissions(List.of("VENDOR_VIEW", "ASSIGNMENT_VIEW"));
        Collection<Long> siteIds = resolveAllowedSiteIdsWithValidation(siteId);
        return widgetResponse(WIDGET_VENDOR_PERFORMANCE, "VENDOR_AMC", "Vendor Performance", "CHART", getVendorPerformance(siteIds), "/vendors", 300,
                List.of(action("VENDOR_VIEW", "Open Vendors", "/vendors")));
    }

    public DashboardWidgetResponseDTO getPmDueWidget(Long siteId) {
        assertAnyPermission(List.of("PM_CALENDAR_VIEW", "REQUEST_VIEW"));
        Collection<Long> siteIds = resolveAllowedSiteIdsWithValidation(siteId);
        return widgetResponse(WIDGET_MAINTENANCE_PM_DUE, "MAINTENANCE", "PM Due This Month", "LIST", getUpcomingMaintenance(siteIds), "/maintenance/preventive", 300,
                List.of(action("REQUEST_CREATE", "Create Request", "/maintenance/requests/new")));
    }

    public DashboardWidgetResponseDTO getActiveAmcContractsWidget(Long siteId) {
        assertAllPermissions(List.of("VENDOR_AMC_VIEW"));
        return widgetResponse(WIDGET_VENDOR_AMC_ACTIVE, "VENDOR_AMC", "Active AMC Contracts", "KPI", vendorAmcService.getDashboard(siteId), "/vendor-amc", 300,
                List.of(action("VENDOR_AMC_CREATE", "Create AMC", "/vendor-amc/new"), action("VENDOR_AMC_RENEW", "Renew AMC", "/vendor-amc")));
    }

    private Collection<Long> resolveAllowedSiteIdsWithValidation(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        return resolveAllowedSiteIds(siteId);
    }

    private void addDepartment(List<DashboardDepartmentDTO> departments, String code, String label, List<DashboardWidgetDefinitionDTO> widgets) {
        List<DashboardWidgetDefinitionDTO> allowedWidgets = widgets.stream()
                .filter(this::canShowWidget)
                .toList();
        if (!allowedWidgets.isEmpty()) {
            departments.add(DashboardDepartmentDTO.builder()
                    .code(code)
                    .label(label)
                    .widgets(allowedWidgets)
                    .build());
        }
    }

    private DashboardWidgetDefinitionDTO widget(String code, String department, String title, String type, String apiPath, Integer refreshSeconds,
                                                String targetPath, String size, List<String> requiredPermissions, List<String> anyOfPermissions,
                                                List<DashboardActionDTO> actions) {
        List<DashboardActionDTO> visibleActions = visibleActions(actions);
        return DashboardWidgetDefinitionDTO.builder()
                .code(code)
                .department(department)
                .title(title)
                .type(type)
                .apiPath(apiPath)
                .refreshSeconds(refreshSeconds)
                .targetPath(targetPath)
                .size(size)
                .requiredPermissions(requiredPermissions)
                .anyOfPermissions(anyOfPermissions)
                .actionPermissions(visibleActions.stream().map(DashboardActionDTO::getPermissionCode).toList())
                .actions(visibleActions)
                .build();
    }

    private DashboardWidgetResponseDTO widgetResponse(String code, String department, String title, String type, Object data, String targetPath,
                                                      Integer refreshSeconds, List<DashboardActionDTO> actions) {
        List<DashboardActionDTO> visibleActions = visibleActions(actions);
        return DashboardWidgetResponseDTO.builder()
                .widgetCode(code)
                .department(department)
                .title(title)
                .type(type)
                .data(data)
                .targetPath(targetPath)
                .refreshSeconds(refreshSeconds)
                .actionPermissions(visibleActions.stream().map(DashboardActionDTO::getPermissionCode).toList())
                .actions(visibleActions)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private boolean canShowWidget(DashboardWidgetDefinitionDTO widget) {
        return hasAllPermissions(widget.getRequiredPermissions()) && hasAnyPermission(widget.getAnyOfPermissions());
    }

    private boolean hasAllPermissions(Collection<String> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return true;
        }
        Set<String> current = accessControlService.getPermissions();
        return permissions.stream().allMatch(current::contains);
    }

    private boolean hasAnyPermission(Collection<String> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return true;
        }
        Set<String> current = accessControlService.getPermissions();
        return permissions.stream().anyMatch(current::contains);
    }

    private void assertAllPermissions(Collection<String> permissions) {
        if (!hasAllPermissions(permissions)) {
            throw new UnauthorizedAccessException("Missing dashboard widget permission");
        }
    }

    private void assertAnyPermission(Collection<String> permissions) {
        if (!hasAnyPermission(permissions)) {
            throw new UnauthorizedAccessException("Missing dashboard widget permission");
        }
    }

    private DashboardActionDTO action(String permissionCode, String label, String targetPath) {
        return DashboardActionDTO.builder()
                .code(permissionCode)
                .label(label)
                .targetPath(targetPath)
                .permissionCode(permissionCode)
                .build();
    }

    private List<DashboardActionDTO> visibleActions(List<DashboardActionDTO> actions) {
        if (actions == null || actions.isEmpty()) {
            return List.of();
        }
        Set<String> permissions = accessControlService.getPermissions();
        return actions.stream()
                .filter((action) -> action.getPermissionCode() == null || permissions.contains(action.getPermissionCode()))
                .toList();
    }

    private String defaultDepartment(List<DashboardDepartmentDTO> departments) {
        Set<String> visible = departments.stream().map(DashboardDepartmentDTO::getCode).collect(Collectors.toSet());
        List<String> priority = List.of("ADMIN", "INVENTORY", "TECHNICIAN_WORK", "MAINTENANCE", "EQUIPMENT", "VENDOR_AMC", "HR", "REPORTS", "OVERVIEW");
        return priority.stream()
                .filter(visible::contains)
                .findFirst()
                .orElse(departments.isEmpty() ? null : departments.get(0).getCode());
    }

    private Map<String, Object> getPermissionAwareSummary(Long siteId) {
        DashboardDTO summary = getSummary(siteId);
        java.util.LinkedHashMap<String, Object> values = new java.util.LinkedHashMap<>();
        if (accessControlService.hasPermission("EQUIPMENT_VIEW")) {
            values.put("totalEquipments", summary.getTotalEquipments());
        }
        if (accessControlService.hasPermission("VENDOR_VIEW")) {
            values.put("activeVendors", summary.getActiveVendors());
        }
        if (accessControlService.hasPermission("REQUEST_VIEW")) {
            values.put("openRequests", summary.getOpenRequests());
        }
        if (accessControlService.hasPermission("SPARE_PART_VIEW")) {
            values.put("lowStockSpareParts", summary.getLowStockSpareParts());
        }
        if (accessControlService.hasPermission("DOWNTIME_VIEW")) {
            values.put("totalDowntimeHours", summary.getTotalDowntimeHours());
        }
        return values;
    }

    private Collection<Long> resolveAllowedSiteIds(Long siteId) {
        if (siteId != null) {
            return List.of(siteId);
        }
        if (accessControlService.isAdmin()) {
            return null;
        }
        return accessControlService.getAllowedSiteIds();
    }

    private List<Equipment> scopedEquipment(Collection<Long> siteIds) {
        if (siteIds == null) {
            return equipmentDAO.findAll();
        }
        if (siteIds.isEmpty()) {
            return List.of();
        }
        return equipmentDAO.findBySiteIds(siteIds);
    }

    private List<EquipmentDowntime> scopedDowntime(Collection<Long> siteIds) {
        if (siteIds == null) {
            return downtimeDAO.findAll();
        }
        if (siteIds.isEmpty()) {
            return List.of();
        }
        return downtimeDAO.findBySiteIds(siteIds);
    }

    private List<MaintenanceAssignment> scopedAssignments(Collection<Long> siteIds) {
        if (siteIds == null) {
            return assignmentDAO.findAll();
        }
        if (siteIds.isEmpty()) {
            return List.of();
        }
        return assignmentDAO.findBySiteIds(siteIds);
    }

    private List<DashboardOverviewDTO.ChartSliceDTO> getEquipmentStatus(Collection<Long> siteIds) {
        return scopedEquipment(siteIds).stream()
                .collect(Collectors.groupingBy(
                        (equipment) -> normalizeLabel(equipment.getOperatingStatus(), "UNKNOWN"),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map((entry) -> DashboardOverviewDTO.ChartSliceDTO.builder()
                        .name(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .toList();
    }

    private List<DashboardOverviewDTO.MonthlyDowntimeDTO> getMonthlyDowntime(Collection<Long> siteIds) {
        int year = LocalDate.now().getYear();
        Map<Integer, Long> minutesByMonth = scopedDowntime(siteIds).stream()
                .filter((downtime) -> downtime.getDowntimeStart() != null && downtime.getDowntimeStart().getYear() == year)
                .collect(Collectors.groupingBy(
                        (downtime) -> downtime.getDowntimeStart().getMonthValue(),
                        Collectors.summingLong((downtime) -> downtime.getDowntimeMinutes() == null ? 0L : downtime.getDowntimeMinutes())
                ));

        return java.util.stream.IntStream.rangeClosed(1, 12)
                .mapToObj((month) -> DashboardOverviewDTO.MonthlyDowntimeDTO.builder()
                        .month(Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .hours(BigDecimal.valueOf(minutesByMonth.getOrDefault(month, 0L)).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP))
                        .build())
                .toList();
    }

    private List<DashboardOverviewDTO.VendorPerformanceDTO> getVendorPerformance(Collection<Long> siteIds) {
        Set<String> completedStatuses = Set.of("COMPLETED", "CLOSED");
        Set<String> ignoredStatuses = Set.of("CANCELLED", "REJECTED");

        return scopedAssignments(siteIds).stream()
                .filter((assignment) -> assignment.getVendor() != null)
                .filter((assignment) -> !ignoredStatuses.contains(normalizeStatus(assignment.getStatus())))
                .collect(Collectors.groupingBy((assignment) -> assignment.getVendor().getVendorName()))
                .entrySet().stream()
                .map((entry) -> {
                    long completed = entry.getValue().stream()
                            .filter((assignment) -> completedStatuses.contains(normalizeStatus(assignment.getStatus())))
                            .count();
                    long open = entry.getValue().size() - completed;
                    BigDecimal performance = entry.getValue().isEmpty()
                            ? BigDecimal.ZERO
                            : BigDecimal.valueOf(completed).multiply(BigDecimal.valueOf(100))
                                    .divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP);
                    return DashboardOverviewDTO.VendorPerformanceDTO.builder()
                            .vendor(entry.getKey())
                            .completed(completed)
                            .open(open)
                            .performance(performance)
                            .build();
                })
                .sorted(Comparator.comparing(DashboardOverviewDTO.VendorPerformanceDTO::getCompleted).reversed())
                .limit(8)
                .toList();
    }

    private List<DashboardOverviewDTO.UpcomingMaintenanceDTO> getUpcomingMaintenance(Collection<Long> siteIds) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(30);
        return scheduleDAO.findUpcoming(today, end).stream()
                .filter((schedule) -> belongsToSites(schedule, siteIds))
                .sorted(Comparator.comparing(PreventiveMaintenanceSchedule::getNextDueDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(8)
                .map(this::toUpcomingMaintenance)
                .toList();
    }

    private DashboardOverviewDTO.UpcomingMaintenanceDTO toUpcomingMaintenance(PreventiveMaintenanceSchedule schedule) {
        long generated = requestDAO.countByPmScheduleId(schedule.getId());
        long completed = requestDAO.countCompletedByPmScheduleId(schedule.getId());
        BigDecimal completion = generated == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(completed).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(generated), 2, RoundingMode.HALF_UP);
        return DashboardOverviewDTO.UpcomingMaintenanceDTO.builder()
                .id(schedule.getId())
                .title(schedule.getTitle())
                .equipmentName(schedule.getEquipment() == null ? null : schedule.getEquipment().getEquipmentName())
                .nextDueDate(schedule.getNextDueDate())
                .frequency(schedule.getFrequency())
                .completionPercentage(completion)
                .build();
    }

    private boolean belongsToSites(PreventiveMaintenanceSchedule schedule, Collection<Long> siteIds) {
        if (siteIds == null) {
            return true;
        }
        Long scheduleSiteId = schedule.getSite() == null ? null : schedule.getSite().getId();
        return scheduleSiteId != null && siteIds.contains(scheduleSiteId);
    }

    private String normalizeStatus(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeLabel(String value, String fallback) {
        String label = value == null || value.isBlank() ? fallback : value.trim();
        return java.util.Arrays.stream(label.split("_"))
                .filter(Objects::nonNull)
                .filter((part) -> !part.isBlank())
                .map((part) -> part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1).toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(" "));
    }
}
