package com.example.cmmsApplication.downtime.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "equipment_downtime")
@Getter
@Setter
@NoArgsConstructor
public class EquipmentDowntime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private MaintenanceRequest request;

    @Column(name = "downtime_start", nullable = false)
    private Instant downtimeStart;

    @Column(name = "downtime_end")
    private Instant downtimeEnd;

    @Column(name = "downtime_minutes")
    private Long downtimeMinutes;

    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    @Column(nullable = false, length = 120)
    private String reason;

    @Column(name = "reason_category", length = 80)
    private String reasonCategory;

    @Column(name = "reason_code", length = 80)
    private String reasonCode;

    @Column(name = "root_cause", length = 1000)
    private String rootCause;

    @Column(name = "production_line", length = 120)
    private String productionLine;

    @Column(name = "shift_name", length = 80)
    private String shiftName;

    @Column(name = "operator_name", length = 120)
    private String operatorName;

    @Column(name = "expected_output_per_hour", precision = 14, scale = 2)
    private BigDecimal expectedOutputPerHour;

    @Column(name = "loss_rate_per_unit", precision = 14, scale = 2)
    private BigDecimal lossRatePerUnit;

    @Column(name = "lost_quantity", precision = 14, scale = 2)
    private BigDecimal lostQuantity;

    @Column(name = "lost_amount", precision = 14, scale = 2)
    private BigDecimal lostAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "closure_remarks", length = 1000)
    private String closureRemarks;

    @Column(nullable = false)
    private Boolean planned = false;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        calculateDuration();
        createdAt = CurrentTimeProvider.now();
        updatedAt = CurrentTimeProvider.now();
    }

    @PreUpdate
    public void onUpdate() {
        calculateDuration();
        updatedAt = CurrentTimeProvider.now();
    }

    private void calculateDuration() {
        if (downtimeStart != null && downtimeEnd != null && downtimeEnd.isAfter(downtimeStart)) {
            downtimeMinutes = Duration.between(downtimeStart, downtimeEnd).toMinutes();
        } else {
            downtimeMinutes = null;
        }
        calculateProductionLoss();
    }

    private void calculateProductionLoss() {
        if (downtimeMinutes == null || expectedOutputPerHour == null) {
            lostQuantity = null;
            lostAmount = null;
            return;
        }
        BigDecimal hours = BigDecimal.valueOf(downtimeMinutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        lostQuantity = expectedOutputPerHour.multiply(hours).setScale(2, RoundingMode.HALF_UP);
        lostAmount = lossRatePerUnit == null ? null : lostQuantity.multiply(lossRatePerUnit).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getDowntimeHours() {
        if (downtimeMinutes == null) {
            return null;
        }
        return BigDecimal.valueOf(downtimeMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getDowntimeDays() {
        if (downtimeMinutes == null) {
            return null;
        }
        return BigDecimal.valueOf(downtimeMinutes).divide(BigDecimal.valueOf(1440), 2, RoundingMode.HALF_UP);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }
    public Site getSite() { return site; }
    public void setSite(Site site) { this.site = site; }
    public MaintenanceRequest getRequest() { return request; }
    public void setRequest(MaintenanceRequest request) { this.request = request; }
    public Instant getDowntimeStart() { return downtimeStart; }
    public void setDowntimeStart(Instant downtimeStart) { this.downtimeStart = downtimeStart; }
    public Instant getDowntimeEnd() { return downtimeEnd; }
    public void setDowntimeEnd(Instant downtimeEnd) { this.downtimeEnd = downtimeEnd; }
    public Long getDowntimeMinutes() { return downtimeMinutes; }
    public void setDowntimeMinutes(Long downtimeMinutes) { this.downtimeMinutes = downtimeMinutes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getReasonCategory() { return reasonCategory; }
    public void setReasonCategory(String reasonCategory) { this.reasonCategory = reasonCategory; }
    public String getReasonCode() { return reasonCode; }
    public void setReasonCode(String reasonCode) { this.reasonCode = reasonCode; }
    public String getRootCause() { return rootCause; }
    public void setRootCause(String rootCause) { this.rootCause = rootCause; }
    public String getProductionLine() { return productionLine; }
    public void setProductionLine(String productionLine) { this.productionLine = productionLine; }
    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
    public BigDecimal getExpectedOutputPerHour() { return expectedOutputPerHour; }
    public void setExpectedOutputPerHour(BigDecimal expectedOutputPerHour) { this.expectedOutputPerHour = expectedOutputPerHour; }
    public BigDecimal getLossRatePerUnit() { return lossRatePerUnit; }
    public void setLossRatePerUnit(BigDecimal lossRatePerUnit) { this.lossRatePerUnit = lossRatePerUnit; }
    public BigDecimal getLostQuantity() { return lostQuantity; }
    public void setLostQuantity(BigDecimal lostQuantity) { this.lostQuantity = lostQuantity; }
    public BigDecimal getLostAmount() { return lostAmount; }
    public void setLostAmount(BigDecimal lostAmount) { this.lostAmount = lostAmount; }
    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public String getClosureRemarks() { return closureRemarks; }
    public void setClosureRemarks(String closureRemarks) { this.closureRemarks = closureRemarks; }
    public Boolean getPlanned() { return planned; }
    public void setPlanned(Boolean planned) { this.planned = planned; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
