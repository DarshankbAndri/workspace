package com.example.cmmsApplication.vendor.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "vendor_site_assignment")
@Getter
@Setter
@NoArgsConstructor
public class VendorSiteAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "is_primary_site")
    private Boolean primarySite = false;

    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

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
