package com.example.cmmsApplication.maintenancerequest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "request_checklist_item")
@Getter
@Setter
@NoArgsConstructor
public class RequestChecklistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private MaintenanceRequest request;

    @Column(name = "source_equipment_checklist_item_id")
    private Long sourceEquipmentChecklistItemId;
    @Column(name = "source_checklist_name", length = 200)
    private String sourceChecklistName;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(name = "task_title", nullable = false, length = 200)
    private String taskTitle;

    @Column(length = 1000)
    private String instructions;

    @Column(nullable = false)
    private Boolean required = true;

    @Column(name = "proof_required", nullable = false)
    private Boolean proofRequired = false;

    @Column(name = "response_type", nullable = false, length = 30)
    private String responseType = "CHECKBOX";

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
