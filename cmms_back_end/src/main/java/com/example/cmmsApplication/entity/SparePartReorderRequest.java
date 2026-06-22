package com.example.cmmsApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_part_reorder_request")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SparePartSiteStock getStock() { return stock; }
    public void setStock(SparePartSiteStock stock) { this.stock = stock; }
    public SparePart getSparePart() { return sparePart; }
    public void setSparePart(SparePart sparePart) { this.sparePart = sparePart; }
    public Site getSite() { return site; }
    public void setSite(Site site) { this.site = site; }
    public MaintenanceAssignment getAssignment() { return assignment; }
    public void setAssignment(MaintenanceAssignment assignment) { this.assignment = assignment; }
    public MaintenanceSpareUsage getSpareRequest() { return spareRequest; }
    public void setSpareRequest(MaintenanceSpareUsage spareRequest) { this.spareRequest = spareRequest; }
    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }
    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }
    public BigDecimal getEstimatedUnitCost() { return estimatedUnitCost; }
    public void setEstimatedUnitCost(BigDecimal estimatedUnitCost) { this.estimatedUnitCost = estimatedUnitCost; }
    public BigDecimal getEstimatedTotalCost() { return estimatedTotalCost; }
    public void setEstimatedTotalCost(BigDecimal estimatedTotalCost) { this.estimatedTotalCost = estimatedTotalCost; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getExpectedDate() { return expectedDate; }
    public void setExpectedDate(LocalDate expectedDate) { this.expectedDate = expectedDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
