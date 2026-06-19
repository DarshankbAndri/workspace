package com.example.cmmsApplication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SparePartDTO {
    private Long id;
    private Long sparePartId;
    @NotBlank(message = "Part code is required")
    private String partCode;
    @NotBlank(message = "Part name is required")
    private String partName;
    private String description;
    private String category;
    @NotBlank(message = "Unit is required")
    private String unit;
    private Long preferredVendorId;
    private String preferredVendorName;
    private String status;
    private Long stockId;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteCode;
    private String siteName;
    private BigDecimal currentStock;
    private BigDecimal reservedStock;
    private BigDecimal availableStock;
    private BigDecimal minimumStock;
    private BigDecimal unitCost;
    private String storageLocation;
    private Boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSparePartId() { return sparePartId; }
    public void setSparePartId(Long sparePartId) { this.sparePartId = sparePartId; }
    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Long getPreferredVendorId() { return preferredVendorId; }
    public void setPreferredVendorId(Long preferredVendorId) { this.preferredVendorId = preferredVendorId; }
    public String getPreferredVendorName() { return preferredVendorName; }
    public void setPreferredVendorName(String preferredVendorName) { this.preferredVendorName = preferredVendorName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getStockId() { return stockId; }
    public void setStockId(Long stockId) { this.stockId = stockId; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }
    public BigDecimal getReservedStock() { return reservedStock; }
    public void setReservedStock(BigDecimal reservedStock) { this.reservedStock = reservedStock; }
    public BigDecimal getAvailableStock() { return availableStock; }
    public void setAvailableStock(BigDecimal availableStock) { this.availableStock = availableStock; }
    public BigDecimal getMinimumStock() { return minimumStock; }
    public void setMinimumStock(BigDecimal minimumStock) { this.minimumStock = minimumStock; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public String getStorageLocation() { return storageLocation; }
    public void setStorageLocation(String storageLocation) { this.storageLocation = storageLocation; }
    public Boolean getLowStock() { return lowStock; }
    public void setLowStock(Boolean lowStock) { this.lowStock = lowStock; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
