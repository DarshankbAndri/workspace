package com.example.cmmsApplication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            mr.id AS id,
            mr.request_number AS request_number,
            mr.equipment_id AS equipment_id,
            e.equipment_code AS equipment_code,
            e.equipment_name AS equipment_name,
            mr.site_id AS site_id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            mr.request_type AS request_type,
            mr.priority AS priority,
            mr.status AS status,
            mr.title AS title,
            mr.description AS description,
            mr.reported_by AS reported_by,
            mr.requested_date AS requested_date,
            mr.target_completion_date AS target_completion_date,
            mr.created_at AS created_at,
            mr.updated_at AS updated_at
        FROM maintenance_request mr
        LEFT JOIN equipment_master e ON e.id = mr.equipment_id
        LEFT JOIN site_master s ON s.site_id = mr.site_id
        """)
public class MaintenanceRequestList {
    @Id
    private Long id;
    @Column(name = "request_number")
    private String requestNumber;
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
    @Column(name = "request_type")
    private String requestType;
    private String priority;
    private String status;
    private String title;
    private String description;
    @Column(name = "reported_by")
    private String reportedBy;
    @Column(name = "requested_date")
    private LocalDate requestedDate;
    @Column(name = "target_completion_date")
    private LocalDate targetCompletionDate;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getRequestNumber() { return requestNumber; }
    public Long getEquipmentId() { return equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public Long getSiteId() { return siteId; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public String getRequestType() { return requestType; }
    public String getPriority() { return priority; }
    public String getStatus() { return status; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getReportedBy() { return reportedBy; }
    public LocalDate getRequestedDate() { return requestedDate; }
    public LocalDate getTargetCompletionDate() { return targetCompletionDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
