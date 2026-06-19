package com.example.cmmsApplication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            stock.stock_id AS id,
            stock.spare_part_id AS spare_part_id,
            part.part_code AS part_code,
            part.part_name AS part_name,
            part.description AS description,
            part.category AS category,
            part.unit AS unit,
            part.preferred_vendor_id AS preferred_vendor_id,
            vendor.vendor_name AS preferred_vendor_name,
            stock.site_id AS site_id,
            site.site_code AS site_code,
            site.site_name AS site_name,
            stock.current_stock AS current_stock,
            stock.reserved_stock AS reserved_stock,
            (stock.current_stock - stock.reserved_stock) AS available_stock,
            stock.minimum_stock AS minimum_stock,
            stock.unit_cost AS unit_cost,
            stock.storage_location AS storage_location,
            stock.status AS status,
            CASE WHEN (stock.current_stock - stock.reserved_stock) <= stock.minimum_stock THEN true ELSE false END AS low_stock,
            stock.created_at AS created_at,
            stock.updated_at AS updated_at
        FROM spare_part_site_stock stock
        JOIN spare_part_master part ON part.spare_part_id = stock.spare_part_id
        LEFT JOIN vendor_master vendor ON vendor.id = part.preferred_vendor_id
        LEFT JOIN site_master site ON site.site_id = stock.site_id
        """)
public class SparePartStockList {
    @Id
    private Long id;
    @Column(name = "spare_part_id")
    private Long sparePartId;
    @Column(name = "part_code")
    private String partCode;
    @Column(name = "part_name")
    private String partName;
    private String description;
    private String category;
    private String unit;
    @Column(name = "preferred_vendor_id")
    private Long preferredVendorId;
    @Column(name = "preferred_vendor_name")
    private String preferredVendorName;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "site_code")
    private String siteCode;
    @Column(name = "site_name")
    private String siteName;
    @Column(name = "current_stock")
    private BigDecimal currentStock;
    @Column(name = "reserved_stock")
    private BigDecimal reservedStock;
    @Column(name = "available_stock")
    private BigDecimal availableStock;
    @Column(name = "minimum_stock")
    private BigDecimal minimumStock;
    @Column(name = "unit_cost")
    private BigDecimal unitCost;
    @Column(name = "storage_location")
    private String storageLocation;
    private String status;
    @Column(name = "low_stock")
    private Boolean lowStock;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public Long getSparePartId() { return sparePartId; }
    public String getPartCode() { return partCode; }
    public String getPartName() { return partName; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getUnit() { return unit; }
    public Long getPreferredVendorId() { return preferredVendorId; }
    public String getPreferredVendorName() { return preferredVendorName; }
    public Long getSiteId() { return siteId; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public BigDecimal getCurrentStock() { return currentStock; }
    public BigDecimal getReservedStock() { return reservedStock; }
    public BigDecimal getAvailableStock() { return availableStock; }
    public BigDecimal getMinimumStock() { return minimumStock; }
    public BigDecimal getUnitCost() { return unitCost; }
    public String getStorageLocation() { return storageLocation; }
    public String getStatus() { return status; }
    public Boolean getLowStock() { return lowStock; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
