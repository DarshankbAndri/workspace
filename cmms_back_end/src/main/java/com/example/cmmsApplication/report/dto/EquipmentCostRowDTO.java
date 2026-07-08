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
public class EquipmentCostRowDTO {
    private String id;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private String category;
    private String criticality;
    private String assetNumber;
    private String costCenter;
    private String department;
    private BigDecimal purchaseCost;
    private BigDecimal maintenanceCost;
    private BigDecimal spareMaterialCost;
    private BigDecimal downtimeCost;
    private BigDecimal totalCostOfOwnership;
}
