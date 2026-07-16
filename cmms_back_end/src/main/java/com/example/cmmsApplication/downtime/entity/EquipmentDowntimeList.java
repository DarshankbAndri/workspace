package com.example.cmmsApplication.downtime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Immutable
@Subselect("""
        SELECT
            d.id AS id,
            d.equipment_id AS equipment_id,
            e.equipment_code AS equipment_code,
            e.equipment_name AS equipment_name,
            d.site_id AS site_id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            d.request_id AS request_id,
            mr.request_number AS request_number,
            mr.title AS request_title,
            d.downtime_start AS downtime_start,
            d.downtime_end AS downtime_end,
            d.downtime_minutes AS downtime_minutes,
            CAST(ROUND(d.downtime_minutes / 60.0, 2) AS NUMERIC(12,2)) AS downtime_hours,
            CAST(ROUND(d.downtime_minutes / 1440.0, 2) AS NUMERIC(12,2)) AS downtime_days,
            d.status AS status,
            d.reason AS reason,
            d.reason_category AS reason_category,
            d.reason_code AS reason_code,
            d.root_cause AS root_cause,
            d.production_line AS production_line,
            d.shift_name AS shift_name,
            d.operator_name AS operator_name,
            d.expected_output_per_hour AS expected_output_per_hour,
            d.loss_rate_per_unit AS loss_rate_per_unit,
            d.lost_quantity AS lost_quantity,
            d.lost_amount AS lost_amount,
            d.verified_by_user_id AS verified_by_user_id,
            CONCAT(u.first_name, ' ', u.last_name) AS verified_by_name,
            d.verified_at AS verified_at,
            d.closed_at AS closed_at,
            d.closure_remarks AS closure_remarks,
            d.planned AS planned,
            d.remarks AS remarks,
            d.created_at AS created_at,
            d.updated_at AS updated_at
        FROM equipment_downtime d
        LEFT JOIN equipment_master e ON e.id = d.equipment_id
        LEFT JOIN site_master s ON s.site_id = d.site_id
        LEFT JOIN maintenance_request mr ON mr.id = d.request_id
        LEFT JOIN users u ON u.id = d.verified_by_user_id
        """)
@Getter
@Setter
@NoArgsConstructor
public class EquipmentDowntimeList {
    @Id
    private Long id;
    @Column(name = "equipment_id")
    private Long equipmentId;
    @Column(name = "equipment_code")
    private String equipmentCode;
    @Column(name = "equipment_name")
    private String equipmentName;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "site_code")
    private String siteCode;
    @Column(name = "site_name")
    private String siteName;
    @Column(name = "request_id")
    private Long requestId;
    @Column(name = "request_number")
    private String requestNumber;
    @Column(name = "request_title")
    private String requestTitle;
    @Column(name = "downtime_start")
    private LocalDateTime downtimeStart;
    @Column(name = "downtime_end")
    private LocalDateTime downtimeEnd;
    @Column(name = "downtime_minutes")
    private Long downtimeMinutes;
    @Column(name = "downtime_hours")
    private BigDecimal downtimeHours;
    @Column(name = "downtime_days")
    private BigDecimal downtimeDays;
    private String status;
    private String reason;
    @Column(name = "reason_category")
    private String reasonCategory;
    @Column(name = "reason_code")
    private String reasonCode;
    @Column(name = "root_cause")
    private String rootCause;
    @Column(name = "production_line")
    private String productionLine;
    @Column(name = "shift_name")
    private String shiftName;
    @Column(name = "operator_name")
    private String operatorName;
    @Column(name = "expected_output_per_hour")
    private BigDecimal expectedOutputPerHour;
    @Column(name = "loss_rate_per_unit")
    private BigDecimal lossRatePerUnit;
    @Column(name = "lost_quantity")
    private BigDecimal lostQuantity;
    @Column(name = "lost_amount")
    private BigDecimal lostAmount;
    @Column(name = "verified_by_user_id")
    private Long verifiedByUserId;
    @Column(name = "verified_by_name")
    private String verifiedByName;
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    @Column(name = "closed_at")
    private LocalDateTime closedAt;
    @Column(name = "closure_remarks")
    private String closureRemarks;
    private Boolean planned;
    private String remarks;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public Long getEquipmentId() { return equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public Long getSiteId() { return siteId; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public Long getRequestId() { return requestId; }
    public String getRequestNumber() { return requestNumber; }
    public String getRequestTitle() { return requestTitle; }
    public LocalDateTime getDowntimeStart() { return downtimeStart; }
    public LocalDateTime getDowntimeEnd() { return downtimeEnd; }
    public Long getDowntimeMinutes() { return downtimeMinutes; }
    public BigDecimal getDowntimeHours() { return downtimeHours; }
    public BigDecimal getDowntimeDays() { return downtimeDays; }
    public String getStatus() { return status; }
    public String getReason() { return reason; }
    public String getReasonCategory() { return reasonCategory; }
    public String getReasonCode() { return reasonCode; }
    public String getRootCause() { return rootCause; }
    public String getProductionLine() { return productionLine; }
    public String getShiftName() { return shiftName; }
    public String getOperatorName() { return operatorName; }
    public BigDecimal getExpectedOutputPerHour() { return expectedOutputPerHour; }
    public BigDecimal getLossRatePerUnit() { return lossRatePerUnit; }
    public BigDecimal getLostQuantity() { return lostQuantity; }
    public BigDecimal getLostAmount() { return lostAmount; }
    public Long getVerifiedByUserId() { return verifiedByUserId; }
    public String getVerifiedByName() { return verifiedByName; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public String getClosureRemarks() { return closureRemarks; }
    public Boolean getPlanned() { return planned; }
    public String getRemarks() { return remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
