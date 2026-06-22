package com.example.cmmsApplication.spareparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SparePartTransactionDTO {
    private Long id;
    private Long stockId;
    private Long sparePartId;
    private String partCode;
    private String partName;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private String transactionType;
    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private BigDecimal stockBefore;
    private BigDecimal stockAfter;
    private String referenceType;
    private Long referenceId;
    private String referenceCode;
    private Long assignmentId;
    private String assignmentStatus;
    private Long assignedToId;
    private String assignedToName;
    private Long maintenanceRequestId;
    private String maintenanceRequestNumber;
    private String maintenanceRequestTitle;
    private String maintenanceRequestStatus;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long sourceSiteId;
    private String sourceSiteName;
    private Long targetSiteId;
    private String targetSiteName;
    private Long purchaseRequestId;
    private String purchaseRequestStatus;
    private String businessDescription;
    private String remarks;
    private LocalDateTime transactionDate;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
}




