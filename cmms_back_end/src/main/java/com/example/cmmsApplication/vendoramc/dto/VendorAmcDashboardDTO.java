package com.example.cmmsApplication.vendoramc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorAmcDashboardDTO {
    private long activeContracts;
    private long expiringContracts;
    private long expiredContracts;
    private long coveredEquipment;
    private long equipmentWithoutAmc;
}
