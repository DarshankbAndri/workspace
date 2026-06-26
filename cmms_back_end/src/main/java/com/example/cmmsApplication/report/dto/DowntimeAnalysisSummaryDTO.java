package com.example.cmmsApplication.report.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DowntimeAnalysisSummaryDTO {
    private Long events;
    private Long plannedEvents;
    private Long unplannedEvents;
    private Long totalMinutes;
    private BigDecimal totalHours;
    private BigDecimal totalDays;

}
