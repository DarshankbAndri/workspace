package com.example.cmmsApplication.vendor.entity;


import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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
