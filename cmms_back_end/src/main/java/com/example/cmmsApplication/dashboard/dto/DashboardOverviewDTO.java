package com.example.cmmsApplication.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardOverviewDTO {
    private DashboardDTO summary;
    private List<ChartSliceDTO> equipmentStatus;
    private List<MonthlyDowntimeDTO> monthlyDowntime;
    private List<VendorPerformanceDTO> vendorPerformance;
    private List<UpcomingMaintenanceDTO> upcomingMaintenance;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartSliceDTO {
        private String name;
        private long value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyDowntimeDTO {
        private String month;
        private BigDecimal hours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorPerformanceDTO {
        private String vendor;
        private long completed;
        private long open;
        private BigDecimal performance;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpcomingMaintenanceDTO {
        private Long id;
        private String title;
        private String equipmentName;
        private LocalDate nextDueDate;
        private String frequency;
        private BigDecimal completionPercentage;
    }
}
