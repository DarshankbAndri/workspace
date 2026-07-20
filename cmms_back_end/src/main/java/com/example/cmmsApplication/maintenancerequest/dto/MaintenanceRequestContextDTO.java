package com.example.cmmsApplication.maintenancerequest.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestContextDTO {
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String equipmentStatus;
    private String operatingStatus;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private Long openRequestCount;
    private Long latestOpenRequestId;
    private String latestOpenRequestNumber;
    private Long activeAmcContractId;
    private String activeAmcContractNumber;
    private Long vendorId;
    private String vendorName;
    private Integer responseTimeHours;
    private Integer resolutionTimeHours;
    private LocalDate amcEndDate;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextPmDate;
    private Long spareBomCount;
    private Integer healthScore;
    private String healthStatus;
}
