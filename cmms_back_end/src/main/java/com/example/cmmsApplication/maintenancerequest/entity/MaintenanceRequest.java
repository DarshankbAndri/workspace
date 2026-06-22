package com.example.cmmsApplication.maintenancerequest.entity;


import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_request")
public class MaintenanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_number", nullable = false, unique = true, length = 60)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    @Column(name = "request_type", nullable = false, length = 40)
    private String requestType = "BREAKDOWN";

    @Column(nullable = false, length = 30)
    private String priority = "MEDIUM";

    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "reported_by", length = 120)
    private String reportedBy;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "target_completion_date")
    private LocalDate targetCompletionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pm_schedule_id")
    private PreventiveMaintenanceSchedule pmSchedule;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (requestedDate == null) {
            requestedDate = LocalDate.now();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }
    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }
    public Site getSite() { return site; }
    public void setSite(Site site) { this.site = site; }
    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
    public LocalDate getTargetCompletionDate() { return targetCompletionDate; }
    public void setTargetCompletionDate(LocalDate targetCompletionDate) { this.targetCompletionDate = targetCompletionDate; }
    public PreventiveMaintenanceSchedule getPmSchedule() { return pmSchedule; }
    public void setPmSchedule(PreventiveMaintenanceSchedule pmSchedule) { this.pmSchedule = pmSchedule; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}





