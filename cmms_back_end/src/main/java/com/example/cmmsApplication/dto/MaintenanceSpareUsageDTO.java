package com.example.cmmsApplication.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getStockId() { return stockId; }
    public void setStockId(Long stockId) { this.stockId = stockId; }
    public Long getSparePartId() { return sparePartId; }
    public void setSparePartId(Long sparePartId) { this.sparePartId = sparePartId; }
    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }
    public BigDecimal getReservedStock() { return reservedStock; }
    public void setReservedStock(BigDecimal reservedStock) { this.reservedStock = reservedStock; }
    public BigDecimal getAvailableStock() { return availableStock; }
    public void setAvailableStock(BigDecimal availableStock) { this.availableStock = availableStock; }
    public BigDecimal getQuantityUsed() { return quantityUsed; }
    public void setQuantityUsed(BigDecimal quantityUsed) { this.quantityUsed = quantityUsed; }
    public BigDecimal getRequestedQty() { return requestedQty; }
    public void setRequestedQty(BigDecimal requestedQty) { this.requestedQty = requestedQty; }
    public BigDecimal getApprovedQty() { return approvedQty; }
    public void setApprovedQty(BigDecimal approvedQty) { this.approvedQty = approvedQty; }
    public BigDecimal getIssuedQty() { return issuedQty; }
    public void setIssuedQty(BigDecimal issuedQty) { this.issuedQty = issuedQty; }
    public BigDecimal getConsumedQty() { return consumedQty; }
    public void setConsumedQty(BigDecimal consumedQty) { this.consumedQty = consumedQty; }
    public BigDecimal getReturnedQty() { return returnedQty; }
    public void setReturnedQty(BigDecimal returnedQty) { this.returnedQty = returnedQty; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getApprovalRequestId() { return approvalRequestId; }
    public void setApprovalRequestId(Long approvalRequestId) { this.approvalRequestId = approvalRequestId; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Long getRequestedBy() { return requestedBy; }
    public void setRequestedBy(Long requestedBy) { this.requestedBy = requestedBy; }
    public String getRequestedByName() { return requestedByName; }
    public void setRequestedByName(String requestedByName) { this.requestedByName = requestedByName; }
    public Long getManagerApprovedBy() { return managerApprovedBy; }
    public void setManagerApprovedBy(Long managerApprovedBy) { this.managerApprovedBy = managerApprovedBy; }
    public String getManagerApprovedByName() { return managerApprovedByName; }
    public void setManagerApprovedByName(String managerApprovedByName) { this.managerApprovedByName = managerApprovedByName; }
    public Long getStoreApprovedBy() { return storeApprovedBy; }
    public void setStoreApprovedBy(Long storeApprovedBy) { this.storeApprovedBy = storeApprovedBy; }
    public String getStoreApprovedByName() { return storeApprovedByName; }
    public void setStoreApprovedByName(String storeApprovedByName) { this.storeApprovedByName = storeApprovedByName; }
    public Long getReservedBy() { return reservedBy; }
    public void setReservedBy(Long reservedBy) { this.reservedBy = reservedBy; }
    public String getReservedByName() { return reservedByName; }
    public void setReservedByName(String reservedByName) { this.reservedByName = reservedByName; }
    public Long getIssuedBy() { return issuedBy; }
    public void setIssuedBy(Long issuedBy) { this.issuedBy = issuedBy; }
    public String getIssuedByName() { return issuedByName; }
    public void setIssuedByName(String issuedByName) { this.issuedByName = issuedByName; }
    public Long getConsumedBy() { return consumedBy; }
    public void setConsumedBy(Long consumedBy) { this.consumedBy = consumedBy; }
    public String getConsumedByName() { return consumedByName; }
    public void setConsumedByName(String consumedByName) { this.consumedByName = consumedByName; }
    public Long getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(Long rejectedBy) { this.rejectedBy = rejectedBy; }
    public String getRejectedByName() { return rejectedByName; }
    public void setRejectedByName(String rejectedByName) { this.rejectedByName = rejectedByName; }
    public Long getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(Long cancelledBy) { this.cancelledBy = cancelledBy; }
    public String getCancelledByName() { return cancelledByName; }
    public void setCancelledByName(String cancelledByName) { this.cancelledByName = cancelledByName; }
    public Long getPurchaseRequestId() { return purchaseRequestId; }
    public void setPurchaseRequestId(Long purchaseRequestId) { this.purchaseRequestId = purchaseRequestId; }
    public String getPurchaseRequestStatus() { return purchaseRequestStatus; }
    public void setPurchaseRequestStatus(String purchaseRequestStatus) { this.purchaseRequestStatus = purchaseRequestStatus; }
    public Long getMaintenanceRequestId() { return maintenanceRequestId; }
    public void setMaintenanceRequestId(Long maintenanceRequestId) { this.maintenanceRequestId = maintenanceRequestId; }
    public String getMaintenanceRequestNumber() { return maintenanceRequestNumber; }
    public void setMaintenanceRequestNumber(String maintenanceRequestNumber) { this.maintenanceRequestNumber = maintenanceRequestNumber; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getReservedAt() { return reservedAt; }
    public void setReservedAt(LocalDateTime reservedAt) { this.reservedAt = reservedAt; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public LocalDateTime getConsumedAt() { return consumedAt; }
    public void setConsumedAt(LocalDateTime consumedAt) { this.consumedAt = consumedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
