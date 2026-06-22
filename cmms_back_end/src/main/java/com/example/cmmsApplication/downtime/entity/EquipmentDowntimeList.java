package com.example.cmmsApplication.downtime.entity;

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
            d.reason AS reason,
            d.planned AS planned,
            d.remarks AS remarks,
            d.created_at AS created_at,
            d.updated_at AS updated_at
        FROM equipment_downtime d
        LEFT JOIN equipment_master e ON e.id = d.equipment_id
        LEFT JOIN site_master s ON s.site_id = d.site_id
        LEFT JOIN maintenance_request mr ON mr.id = d.request_id
        """)
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
    private String reason;
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
    public String getReason() { return reason; }
    public Boolean getPlanned() { return planned; }
    public String getRemarks() { return remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}




