package com.example.cmmsApplication.spareparts.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceSpareUsageDTO {
    private Long id;
    private Long assignmentId;
    @NotNull(message = "Stock item is required")
    private Long stockId;
    private Long sparePartId;
    private String partCode;
    private String partName;
    private String unit;
    private Long siteId;
    private String siteName;
    private BigDecimal currentStock;
    private BigDecimal reservedStock;
    private BigDecimal availableStock;
    @NotNull(message = "Quantity used is required")
    private BigDecimal quantityUsed;
    private BigDecimal requestedQty;
    private BigDecimal approvedQty;
    private BigDecimal issuedQty;
    private BigDecimal consumedQty;
    private BigDecimal returnedQty;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String status;
    private Long approvalRequestId;
    private String approvalStatus;
    private String remarks;
    private Long requestedBy;
    private String requestedByName;
    private Long managerApprovedBy;
    private String managerApprovedByName;
    private Long storeApprovedBy;
    private String storeApprovedByName;
    private Long reservedBy;
    private String reservedByName;
    private Long issuedBy;
    private String issuedByName;
    private Long consumedBy;
    private String consumedByName;
    private Long rejectedBy;
    private String rejectedByName;
    private Long cancelledBy;
    private String cancelledByName;
    private Long purchaseRequestId;
    private String purchaseRequestStatus;
    private Long maintenanceRequestId;
    private String maintenanceRequestNumber;
    private LocalDateTime requestedAt;
    private LocalDateTime reservedAt;
    private LocalDateTime issuedAt;
    private LocalDateTime consumedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
