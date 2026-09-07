package com.example.cmmsApplication.assignment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Immutable
@Subselect("""
        SELECT
            ma.id AS id,
            mr.site_id AS site_id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            ma.request_id AS request_id,
            mr.request_number AS request_number,
            mr.title AS request_title,
            mr.status AS request_status,
            mr.equipment_id AS equipment_id,
            eq.equipment_code AS equipment_code,
            eq.equipment_name AS equipment_name,
            ma.vendor_id AS vendor_id,
            v.vendor_name AS vendor_name,
            ma.assigned_employee_id AS assigned_employee_id,
            e.employee_code AS assigned_employee_code,
            CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) AS assigned_employee_name,
            ma.assigned_to AS assigned_to,
            ma.assigned_date AS assigned_date,
            ma.planned_start_date AS planned_start_date,
            ma.planned_end_date AS planned_end_date,
            ma.actual_start_date AS actual_start_date,
            ma.actual_end_date AS actual_end_date,
            ma.status AS status,
            ma.estimated_cost AS estimated_cost,
            ma.actual_cost AS actual_cost,
            ma.remarks AS remarks,
            ma.created_at AS created_at,
            ma.updated_at AS updated_at
        FROM maintenance_assignment ma
        JOIN maintenance_request mr ON mr.id = ma.request_id
        LEFT JOIN equipment_master eq ON eq.id = mr.equipment_id
        LEFT JOIN site_master s ON s.site_id = mr.site_id
        LEFT JOIN vendor_master v ON v.id = ma.vendor_id
        LEFT JOIN employee_master e ON e.employee_id = ma.assigned_employee_id
        """)
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceAssignmentList {
    @Id
    private Long id;
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
    @Column(name = "request_status")
    private String requestStatus;
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
    @Column(name = "assigned_employee_id")
    private Long assignedEmployeeId;
    @Column(name = "assigned_employee_code")
    private String assignedEmployeeCode;
    @Column(name = "assigned_employee_name")
    private String assignedEmployeeName;
    @Column(name = "assigned_to")
    private String assignedTo;
    @Column(name = "assigned_date")
    private LocalDate assignedDate;
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;
    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;
    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;
    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;
    private String status;
    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;
    @Column(name = "actual_cost")
    private BigDecimal actualCost;
    private String remarks;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public Long getSiteId() { return siteId; }
    public String getSiteCode() { return siteCode; }
    public String getSiteName() { return siteName; }
    public Long getRequestId() { return requestId; }
    public String getRequestNumber() { return requestNumber; }
    public String getRequestTitle() { return requestTitle; }
    public String getRequestStatus() { return requestStatus; }
    public String getMaintenanceRequestStatus() { return requestStatus; }
    public Long getEquipmentId() { return equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public Long getVendorId() { return vendorId; }
    public String getVendorName() { return vendorName; }
    public Long getAssignedEmployeeId() { return assignedEmployeeId; }
    public String getAssignedEmployeeCode() { return assignedEmployeeCode; }
    public String getAssignedEmployeeName() { return assignedEmployeeName; }
    public String getAssignedTo() { return assignedTo; }
    public LocalDate getAssignedDate() { return assignedDate; }
    public LocalDate getPlannedStartDate() { return plannedStartDate; }
    public LocalDate getPlannedEndDate() { return plannedEndDate; }
    public LocalDate getActualStartDate() { return actualStartDate; }
    public LocalDate getActualEndDate() { return actualEndDate; }
    public String getStatus() { return status; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public BigDecimal getActualCost() { return actualCost; }
    public String getRemarks() { return remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
