package com.example.cmmsApplication.equipment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentHealthDTO {
    private Long equipmentId;
    private Integer healthScore;
    private String healthStatus;
    private BigDecimal mtbfHours;
    private BigDecimal mttrHours;
    private LocalDateTime lastFailureDate;
    private Long repeatedFailureCount;
    private Long downtimeFrequency90Days;
    private Long downtimeMinutes90Days;
    private Long criticalOpenRequestCount;
    private Long overduePmCount;
    private Integer assetAgeYears;
}
