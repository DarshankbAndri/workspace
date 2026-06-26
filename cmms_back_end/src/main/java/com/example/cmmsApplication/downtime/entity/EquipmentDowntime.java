package com.example.cmmsApplication.downtime.entity;


import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
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
    private LocalDateTime downtimeStart;

    @Column(name = "downtime_end")
    private LocalDateTime downtimeEnd;

    @Column(name = "downtime_minutes")
    private Long downtimeMinutes;

    @Column(nullable = false, length = 120)
    private String reason;

    @Column(nullable = false)
    private Boolean planned = false;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        calculateDuration();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        calculateDuration();
        updatedAt = LocalDateTime.now();
    }

    private void calculateDuration() {
        if (downtimeStart != null && downtimeEnd != null && downtimeEnd.isAfter(downtimeStart)) {
            downtimeMinutes = Duration.between(downtimeStart, downtimeEnd).toMinutes();
        } else {
            downtimeMinutes = null;
        }
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
    public LocalDateTime getDowntimeStart() { return downtimeStart; }
    public void setDowntimeStart(LocalDateTime downtimeStart) { this.downtimeStart = downtimeStart; }
    public LocalDateTime getDowntimeEnd() { return downtimeEnd; }
    public void setDowntimeEnd(LocalDateTime downtimeEnd) { this.downtimeEnd = downtimeEnd; }
    public Long getDowntimeMinutes() { return downtimeMinutes; }
    public void setDowntimeMinutes(Long downtimeMinutes) { this.downtimeMinutes = downtimeMinutes; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Boolean getPlanned() { return planned; }
    public void setPlanned(Boolean planned) { this.planned = planned; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
