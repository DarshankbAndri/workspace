package com.example.cmmsApplication.report.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DowntimeAnalysisRowDTO {
    private String id;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private Long events;
    private Long plannedEvents;
    private Long unplannedEvents;
    private Long totalMinutes;
    private BigDecimal totalHours;
    private BigDecimal totalDays;

}
