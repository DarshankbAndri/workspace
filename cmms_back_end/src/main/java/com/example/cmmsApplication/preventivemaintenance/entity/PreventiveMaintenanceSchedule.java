package com.example.cmmsApplication.preventivemaintenance.entity;


import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "preventive_maintenance_schedule")
@Getter
@Setter
@NoArgsConstructor
public class PreventiveMaintenanceSchedule {
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
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "schedule_code", nullable = false, unique = true, length = 60)
    private String scheduleCode;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 20)
    private String frequency;

    @Column(nullable = false, length = 30)
    private String priority = "MEDIUM";

    @Column(name = "assigned_to", length = 120)
    private String assignedTo;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "last_notification_status", length = 120)
    private String lastNotificationStatus;

    @Column(name = "last_notification_at")
    private LocalDateTime lastNotificationAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (nextDueDate == null) {
            nextDueDate = startDate;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
