package com.example.cmmsApplication.vendor.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "vendor_master")
@Getter
@Setter
@NoArgsConstructor
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_code", nullable = false, unique = true, length = 50)
    private String vendorCode;

    @Column(name = "vendor_name", nullable = false, length = 150)
    private String vendorName;

    @Column(name = "contact_person", length = 120)
    private String contactPerson;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "service_category", length = 120)
    private String serviceCategory;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VendorSiteAssignment> siteAssignments = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        createdAt = CurrentTimeProvider.now();
        updatedAt = CurrentTimeProvider.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = CurrentTimeProvider.now();
    }

}
