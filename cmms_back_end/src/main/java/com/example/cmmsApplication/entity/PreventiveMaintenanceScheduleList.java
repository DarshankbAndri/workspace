package com.example.cmmsApplication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            p.id AS id,
            p.schedule_code AS schedule_code,
            p.site_id AS site_id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            p.equipment_id AS equipment_id,
            e.equipment_code AS equipment_code,
            e.equipment_name AS equipment_name,
            p.vendor_id AS vendor_id,
            v.vendor_name AS vendor_name,
            p.title AS title,
            p.description AS description,
            p.frequency AS frequency,
            p.priority AS priority,
            p.assigned_to AS assigned_to,
            p.start_date AS start_date,
            p.next_due_date AS next_due_date,
            p.last_generated_date AS last_generated_date,
            p.active AS active,
            p.last_notification_status AS last_notification_status,
            p.last_notification_at AS last_notification_at,
            COALESCE(work_orders.generated_work_orders, 0) AS generated_work_orders,
            COALESCE(work_orders.completed_work_orders, 0) AS completed_work_orders,
            CASE
                WHEN COALESCE(work_orders.generated_work_orders, 0) = 0 THEN 0
                ELSE CAST(ROUND(work_orders.completed_work_orders * 100.0 / work_orders.generated_work_orders, 2) AS NUMERIC(12,2))
            END AS completion_percentage,
            p.created_at AS created_at,
            p.updated_at AS updated_at
        FROM preventive_maintenance_schedule p
        LEFT JOIN site_master s ON s.site_id = p.site_id
        LEFT JOIN equipment_master e ON e.id = p.equipment_id
        LEFT JOIN vendor_master v ON v.id = p.vendor_id
        LEFT JOIN (
            SELECT pm_schedule_id,
                   COUNT(*) AS generated_work_orders,
                   COUNT(*) FILTER (WHERE status = 'CLOSED') AS completed_work_orders
            FROM maintenance_request
            WHERE pm_schedule_id IS NOT NULL
            GROUP BY pm_schedule_id
        ) work_orders ON work_orders.pm_schedule_id = p.id
        """)
public class PreventiveMaintenanceScheduleList {
    @Id
    private Long id;
    @Column(name = "schedule_code")
    private String scheduleCode;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "site_code")
    private String siteCode;
    @Column(name = "site_name")
    private String siteName;
    @Column(name = "equipment_id")
    private Long equipmentId;
    @Column(name = "equipment_code")
    private String equipmentCode;
    @Column(name = "equipment_name")
    private String equipmentName;
    @Column(name = "vendor_id")
    private Long vendorId;
    @Column(name = "vendor_name")
    private String vendorName;
    private String title;
    private String description;
    private String frequency;
    private String priority;
    @Column(name = "assigned_to")
    private String assignedTo;
    @Column(name = "start_date")
    private LocalDate startDate;
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;
    private Boolean active;
    @Column(name = "last_notification_status")
    private String lastNotificationStatus;
    @Column(name = "last_notification_at")
    private LocalDateTime lastNotificationAt;
    @Column(name = "generated_work_orders")
    private Long generatedWorkOrders;
    @Column(name = "completed_work_orders")
    private Long completedWorkOrders;
    @Column(name = "completion_percentage")
    private BigDecimal completionPercentage;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getScheduleCode() { return scheduleCode; }
    public Long getSiteId() { return siteId; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public Long getEquipmentId() { return equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public Long getVendorId() { return vendorId; }
    public String getVendorName() { return vendorName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFrequency() { return frequency; }
    public String getPriority() { return priority; }
    public String getAssignedTo() { return assignedTo; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getNextDueDate() { return nextDueDate; }
    public LocalDate getLastGeneratedDate() { return lastGeneratedDate; }
    public Boolean getActive() { return active; }
    public String getLastNotificationStatus() { return lastNotificationStatus; }
    public LocalDateTime getLastNotificationAt() { return lastNotificationAt; }
    public Long getGeneratedWorkOrders() { return generatedWorkOrders; }
    public Long getCompletedWorkOrders() { return completedWorkOrders; }
    public BigDecimal getCompletionPercentage() { return completionPercentage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
