package com.example.cmmsApplication.spareparts.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStockId() { return stockId; }
    public void setStockId(Long stockId) { this.stockId = stockId; }
    public Long getSparePartId() { return sparePartId; }
    public void setSparePartId(Long sparePartId) { this.sparePartId = sparePartId; }
    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public BigDecimal getStockBefore() { return stockBefore; }
    public void setStockBefore(BigDecimal stockBefore) { this.stockBefore = stockBefore; }
    public BigDecimal getStockAfter() { return stockAfter; }
    public void setStockAfter(BigDecimal stockAfter) { this.stockAfter = stockAfter; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }
    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
    public Long getMaintenanceRequestId() { return maintenanceRequestId; }
    public void setMaintenanceRequestId(Long maintenanceRequestId) { this.maintenanceRequestId = maintenanceRequestId; }
    public String getMaintenanceRequestNumber() { return maintenanceRequestNumber; }
    public void setMaintenanceRequestNumber(String maintenanceRequestNumber) { this.maintenanceRequestNumber = maintenanceRequestNumber; }
    public String getMaintenanceRequestTitle() { return maintenanceRequestTitle; }
    public void setMaintenanceRequestTitle(String maintenanceRequestTitle) { this.maintenanceRequestTitle = maintenanceRequestTitle; }
    public String getMaintenanceRequestStatus() { return maintenanceRequestStatus; }
    public void setMaintenanceRequestStatus(String maintenanceRequestStatus) { this.maintenanceRequestStatus = maintenanceRequestStatus; }
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public Long getSourceSiteId() { return sourceSiteId; }
    public void setSourceSiteId(Long sourceSiteId) { this.sourceSiteId = sourceSiteId; }
    public String getSourceSiteName() { return sourceSiteName; }
    public void setSourceSiteName(String sourceSiteName) { this.sourceSiteName = sourceSiteName; }
    public Long getTargetSiteId() { return targetSiteId; }
    public void setTargetSiteId(Long targetSiteId) { this.targetSiteId = targetSiteId; }
    public String getTargetSiteName() { return targetSiteName; }
    public void setTargetSiteName(String targetSiteName) { this.targetSiteName = targetSiteName; }
    public Long getPurchaseRequestId() { return purchaseRequestId; }
    public void setPurchaseRequestId(Long purchaseRequestId) { this.purchaseRequestId = purchaseRequestId; }
    public String getPurchaseRequestStatus() { return purchaseRequestStatus; }
    public void setPurchaseRequestStatus(String purchaseRequestStatus) { this.purchaseRequestStatus = purchaseRequestStatus; }
    public String getBusinessDescription() { return businessDescription; }
    public void setBusinessDescription(String businessDescription) { this.businessDescription = businessDescription; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}




