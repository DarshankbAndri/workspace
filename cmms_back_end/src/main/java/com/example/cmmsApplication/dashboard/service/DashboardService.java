package com.example.cmmsApplication.dashboard.service;


import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
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
import com.example.cmmsApplication.dashboard.dto.DashboardDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardOverviewDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
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
