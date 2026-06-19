package com.example.cmmsApplication.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class StockTransferDTO {
    @NotNull(message = "Target site is required")
    private Long targetSiteId;
    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;
    private String targetStorageLocation;
    private String remarks;

    public Long getTargetSiteId() { return targetSiteId; }
    public void setTargetSiteId(Long targetSiteId) { this.targetSiteId = targetSiteId; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getTargetStorageLocation() { return targetStorageLocation; }
    public void setTargetStorageLocation(String targetStorageLocation) { this.targetStorageLocation = targetStorageLocation; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
