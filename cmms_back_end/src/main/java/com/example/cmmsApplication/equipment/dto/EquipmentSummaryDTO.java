package com.example.cmmsApplication.equipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentSummaryDTO {
    private Long equipmentId;
    private Long openRequestCount;
    private Long activePmCount;
    private LocalDateTime lastDowntimeAt;
    private String lastDowntimeReason;
    private Long lastDowntimeMinutes;
    private Long totalDowntimeMinutesThisMonth;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextPmDate;
    private Integer healthScore;
    private String healthStatus;
}
