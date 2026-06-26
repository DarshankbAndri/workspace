package com.example.cmmsApplication.spareparts.entity;


import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.vendor.entity.Vendor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_part_reorder_request")
@Getter
@Setter
@NoArgsConstructor
public class SparePartReorderRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reorder_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private SparePartSiteStock stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private MaintenanceAssignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_request_id")
    private MaintenanceSpareUsage spareRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "requested_quantity", nullable = false, precision = 14, scale = 3)
    private BigDecimal requestedQuantity;

    @Column(name = "estimated_unit_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedUnitCost = BigDecimal.ZERO;

    @Column(name = "estimated_total_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal estimatedTotalCost = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Column(length = 1000)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        requestedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
