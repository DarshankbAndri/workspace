package com.example.cmmsApplication.dto;

import java.math.BigDecimal;

public class DashboardDTO {
    private long totalEquipments;
    private long activeVendors;
    private long openRequests;
    private long lowStockSpareParts;
    private BigDecimal totalDowntimeHours;

    public DashboardDTO(long totalEquipments, long activeVendors, long openRequests, BigDecimal totalDowntimeHours) {
        this.totalEquipments = totalEquipments;
        this.activeVendors = activeVendors;
        this.openRequests = openRequests;
        this.totalDowntimeHours = totalDowntimeHours;
    }

    public DashboardDTO(long totalEquipments, long activeVendors, long openRequests, long lowStockSpareParts, BigDecimal totalDowntimeHours) {
        this(totalEquipments, activeVendors, openRequests, totalDowntimeHours);
        this.lowStockSpareParts = lowStockSpareParts;
    }

    public long getTotalEquipments() { return totalEquipments; }
    public void setTotalEquipments(long totalEquipments) { this.totalEquipments = totalEquipments; }
    public long getActiveVendors() { return activeVendors; }
    public void setActiveVendors(long activeVendors) { this.activeVendors = activeVendors; }
    public long getOpenRequests() { return openRequests; }
    public void setOpenRequests(long openRequests) { this.openRequests = openRequests; }
    public long getLowStockSpareParts() { return lowStockSpareParts; }
    public void setLowStockSpareParts(long lowStockSpareParts) { this.lowStockSpareParts = lowStockSpareParts; }
    public BigDecimal getTotalDowntimeHours() { return totalDowntimeHours; }
    public void setTotalDowntimeHours(BigDecimal totalDowntimeHours) { this.totalDowntimeHours = totalDowntimeHours; }
}
