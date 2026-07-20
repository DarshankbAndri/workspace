package com.example.cmmsApplication.vendoramc.entity;

import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_amc_contract")
@Getter
@Setter
@NoArgsConstructor
public class VendorAmcContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "contract_number", nullable = false, unique = true, length = 80)
    private String contractNumber;

    @Column(name = "contract_name", nullable = false, length = 180)
    private String contractName;

    @Column(name = "contract_type", length = 60)
    private String contractType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "contract_value", precision = 14, scale = 2)
    private BigDecimal contractValue;

    @Column(name = "coverage_description", length = 1000)
    private String coverageDescription;

    @Column(name = "response_time_hours")
    private Integer responseTimeHours;

    @Column(name = "resolution_time_hours")
    private Integer resolutionTimeHours;

    @Column(name = "includes_labor", nullable = false)
    private Boolean includesLabor = true;

    @Column(name = "includes_spares", nullable = false)
    private Boolean includesSpares = false;

    @Column(nullable = false, length = 30)
    private String status = "DRAFT";

    @Column(name = "contact_person", length = 120)
    private String contactPerson;

    @Column(name = "contact_phone", length = 40)
    private String contactPhone;

    @Column(name = "contact_email", length = 160)
    private String contactEmail;

    @Column(length = 1000)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renewed_from_contract_id")
    private VendorAmcContract renewedFromContract;

    @Column(name = "created_by", length = 120)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 120)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
