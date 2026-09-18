package com.example.cmmsApplication.spareparts.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "maintenance_spare_usage")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceSpareUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private MaintenanceAssignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private SparePartSiteStock stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @Column(name = "quantity_used", nullable = false, precision = 14, scale = 3)
    private BigDecimal quantityUsed;

    @Column(name = "approved_qty", precision = 14, scale = 3)
    private BigDecimal approvedQty;

    @Column(name = "issued_qty", nullable = false, precision = 14, scale = 3)
    private BigDecimal issuedQty = BigDecimal.ZERO;

    @Column(name = "consumed_qty", nullable = false, precision = 14, scale = 3)
    private BigDecimal consumedQty = BigDecimal.ZERO;

    @Column(name = "returned_qty", nullable = false, precision = 14, scale = 3)
    private BigDecimal returnedQty = BigDecimal.ZERO;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(length = 1000)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_approved_by")
    private User managerApprovedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_approved_by")
    private User storeApprovedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserved_by")
    private User reservedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumed_by")
    private User consumedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by")
    private User rejectedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private User cancelledBy;

    @Column(name = "requested_at")
    private Instant requestedAt;

    @Column(name = "reserved_at")
    private Instant reservedAt;

    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_id")
    private SparePartReorderRequest purchaseRequest;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = CurrentTimeProvider.now();
        updatedAt = CurrentTimeProvider.now();
        if (requestedAt == null) {
            requestedAt = createdAt;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = CurrentTimeProvider.now();
    }

}
