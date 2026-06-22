package com.example.cmmsApplication.vendor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            v.id AS id,
            v.vendor_code AS vendor_code,
            v.vendor_name AS vendor_name,
            v.contact_person AS contact_person,
            v.email AS email,
            v.phone AS phone,
            v.address AS address,
            v.service_category AS service_category,
            v.active AS active,
            primary_site.site_id AS site_id,
            primary_site.site_name AS primary_site_name,
            COALESCE(site_counts.assigned_site_count, 0) AS assigned_site_count,
            COALESCE(site_names.site_names, '') AS site_names,
            v.created_at AS created_at,
            v.updated_at AS updated_at
        FROM vendor_master v
        LEFT JOIN (
            SELECT DISTINCT ON (vsa.vendor_id) vsa.vendor_id, s.site_id, s.site_name
            FROM vendor_site_assignment vsa
            JOIN site_master s ON s.site_id = vsa.site_id
            WHERE vsa.status <> 'INACTIVE'
            ORDER BY vsa.vendor_id, vsa.is_primary_site DESC, s.site_name
        ) primary_site ON primary_site.vendor_id = v.id
        LEFT JOIN (
            SELECT vendor_id, COUNT(*) AS assigned_site_count
            FROM vendor_site_assignment
            WHERE status <> 'INACTIVE'
            GROUP BY vendor_id
        ) site_counts ON site_counts.vendor_id = v.id
        LEFT JOIN (
            SELECT vsa.vendor_id, STRING_AGG(s.site_name, ', ' ORDER BY s.site_name) AS site_names
            FROM vendor_site_assignment vsa
            JOIN site_master s ON s.site_id = vsa.site_id
            WHERE vsa.status <> 'INACTIVE'
            GROUP BY vsa.vendor_id
        ) site_names ON site_names.vendor_id = v.id
        """)
public class VendorList {
    @Id
    private Long id;
    @Column(name = "vendor_code")
    private String vendorCode;
    @Column(name = "vendor_name")
    private String vendorName;
    @Column(name = "contact_person")
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    @Column(name = "service_category")
    private String serviceCategory;
    private Boolean active;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "primary_site_name")
    private String primarySiteName;
    @Column(name = "assigned_site_count")
    private Integer assignedSiteCount;
    @Column(name = "site_names")
    private String siteNames;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getVendorCode() { return vendorCode; }
    public String getVendorName() { return vendorName; }
    public String getContactPerson() { return contactPerson; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getServiceCategory() { return serviceCategory; }
    public Boolean getActive() { return active; }
    public Long getSiteId() { return siteId; }
    public String getPrimarySiteName() { return primarySiteName; }
    public Integer getAssignedSiteCount() { return assignedSiteCount; }
    public String getSiteNames() { return siteNames; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}




