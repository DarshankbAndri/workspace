package com.example.cmmsApplication.equipment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Immutable
@Subselect("""
        SELECT
            e.id AS id,
            e.equipment_code AS equipment_code,
            e.equipment_name AS equipment_name,
            e.category AS equipment_type,
            e.category AS category,
            e.location AS location,
            e.status AS equipment_status,
            e.status AS status,
            e.criticality AS criticality,
            e.site_id AS site_id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            vendor_summary.vendor_id AS vendor_id,
            v.vendor_name AS vendor_name,
            e.manufacturer AS make,
            e.manufacturer AS manufacturer,
            e.model_number AS model,
            e.model_number AS model_number,
            e.serial_number AS serial_number,
            e.lifecycle_status AS lifecycle_status,
            e.asset_condition AS asset_condition,
            e.operating_status AS operating_status,
            e.ownership_type AS ownership_type,
            e.commissioning_date AS commissioning_date,
            e.decommission_date AS decommission_date,
            e.asset_number AS asset_number,
            e.purchase_date AS purchase_date,
            e.purchase_cost AS purchase_cost,
            e.capitalization_date AS capitalization_date,
            e.depreciation_method AS depreciation_method,
            e.cost_center AS cost_center,
            e.department AS department,
            e.created_at AS created_at,
            e.updated_at AS last_modified_on
        FROM equipment_master e
        LEFT JOIN site_master s ON s.site_id = e.site_id
        LEFT JOIN (
            SELECT pms.equipment_id, MIN(pms.vendor_id) AS vendor_id
            FROM preventive_maintenance_schedule pms
            WHERE pms.vendor_id IS NOT NULL
            GROUP BY pms.equipment_id
        ) vendor_summary ON vendor_summary.equipment_id = e.id
        LEFT JOIN vendor_master v ON v.id = vendor_summary.vendor_id
        """)
@Getter
@Setter
@NoArgsConstructor
public class EquipmentList {
    @Id
    private Long id;

    @Column(name = "equipment_code")
    private String equipmentCode;

    @Column(name = "equipment_name")
    private String equipmentName;

    @Column(name = "equipment_type")
    private String equipmentType;

    private String category;
    private String location;

    @Column(name = "equipment_status")
    private String equipmentStatus;

    private String status;
    private String criticality;

    @Column(name = "site_id")
    private Long siteId;

    @Column(name = "site_code")
    private String siteCode;

    @Column(name = "site_name")
    private String siteName;

    @Column(name = "vendor_id")
    private Long vendorId;

    @Column(name = "vendor_name")
    private String vendorName;

    private String make;
    private String manufacturer;
    private String model;

    @Column(name = "model_number")
    private String modelNumber;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "lifecycle_status")
    private String lifecycleStatus;

    @Column(name = "asset_condition")
    private String assetCondition;

    @Column(name = "operating_status")
    private String operatingStatus;

    @Column(name = "ownership_type")
    private String ownershipType;

    @Column(name = "commissioning_date")
    private LocalDate commissioningDate;

    @Column(name = "decommission_date")
    private LocalDate decommissionDate;

    @Column(name = "asset_number")
    private String assetNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost")
    private BigDecimal purchaseCost;

    @Column(name = "capitalization_date")
    private LocalDate capitalizationDate;

    @Column(name = "depreciation_method")
    private String depreciationMethod;

    @Column(name = "cost_center")
    private String costCenter;

    private String department;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_modified_on")
    private LocalDateTime lastModifiedOn;

    public Long getId() { return id; }
    public String getEquipmentCode() { return equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public String getEquipmentType() { return equipmentType; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getEquipmentStatus() { return equipmentStatus; }
    public String getStatus() { return status; }
    public String getCriticality() { return criticality; }
    public Long getSiteId() { return siteId; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public Long getVendorId() { return vendorId; }
    public String getVendorName() { return vendorName; }
    public String getMake() { return make; }
    public String getManufacturer() { return manufacturer; }
    public String getModel() { return model; }
    public String getModelNumber() { return modelNumber; }
    public String getSerialNumber() { return serialNumber; }
    public String getLifecycleStatus() { return lifecycleStatus; }
    public String getAssetCondition() { return assetCondition; }
    public String getOperatingStatus() { return operatingStatus; }
    public String getOwnershipType() { return ownershipType; }
    public LocalDate getCommissioningDate() { return commissioningDate; }
    public LocalDate getDecommissionDate() { return decommissionDate; }
    public String getAssetNumber() { return assetNumber; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public LocalDate getCapitalizationDate() { return capitalizationDate; }
    public String getDepreciationMethod() { return depreciationMethod; }
    public String getCostCenter() { return costCenter; }
    public String getDepartment() { return department; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastModifiedOn() { return lastModifiedOn; }
}
