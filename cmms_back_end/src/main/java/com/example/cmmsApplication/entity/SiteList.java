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
            s.site_id AS id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            s.organization_name AS organization_name,
            s.site_type AS site_type,
            s.address_line1 AS address_line1,
            s.address_line2 AS address_line2,
            s.city AS city,
            s.state AS state,
            s.country AS country,
            s.pincode AS pincode,
            s.contact_person AS contact_person,
            s.contact_mobile AS contact_mobile,
            s.contact_email AS contact_email,
            s.latitude AS latitude,
            s.longitude AS longitude,
            s.status AS status,
            s.created_at AS created_at,
            s.updated_at AS updated_at
        FROM site_master s
        """)
public class SiteList {
    @Id
    private Long id;
    @Column(name = "site_code")
    private String siteCode;
    @Column(name = "site_name")
    private String siteName;
    @Column(name = "organization_name")
    private String organizationName;
    @Column(name = "site_type")
    private String siteType;
    @Column(name = "address_line1")
    private String addressLine1;
    @Column(name = "address_line2")
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String pincode;
    @Column(name = "contact_person")
    private String contactPerson;
    @Column(name = "contact_mobile")
    private String contactMobile;
    @Column(name = "contact_email")
    private String contactEmail;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public String getOrganizationName() { return organizationName; }
    public String getSiteType() { return siteType; }
    public String getAddressLine1() { return addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getCountry() { return country; }
    public String getPincode() { return pincode; }
    public String getContactPerson() { return contactPerson; }
    public String getContactMobile() { return contactMobile; }
    public String getContactEmail() { return contactEmail; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
