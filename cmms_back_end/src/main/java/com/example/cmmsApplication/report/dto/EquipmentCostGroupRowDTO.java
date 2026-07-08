package com.example.cmmsApplication.report.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentCostGroupRowDTO {
    private String id;
    private String groupKey;
    private String groupName;
    private Long assetCount;
    private BigDecimal purchaseCost;
    private BigDecimal maintenanceCost;
    private BigDecimal spareMaterialCost;
    private BigDecimal downtimeCost;
    private BigDecimal totalCostOfOwnership;
}
