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
public class EquipmentSpareBomDTO {
    private Long bomId;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long stockId;
    private Long sparePartId;
    private String partCode;
    private String partName;
    private String category;
    private String unit;
    private Long siteId;
    private String siteName;
    private BigDecimal currentStock;
    private BigDecimal reservedStock;
    private BigDecimal availableStock;
    private BigDecimal minimumStock;
    private BigDecimal recommendedQty;
    private String criticality;
    private String replacementFrequency;
    private String remarks;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
