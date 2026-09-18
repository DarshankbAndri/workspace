package com.example.cmmsApplication.maintenancerequest.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "maintenance_request")
@Getter
@Setter
@NoArgsConstructor
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "amc_contract_id")
    private VendorAmcContract amcContract;

    @Column(name = "amc_covered")
    private Boolean amcCovered = false;

    @Column(name = "external_vendor_assignment")
    private Boolean externalVendorAssignment = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "vendor_reference_number", length = 120)
    private String vendorReferenceNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        if (requestedDate == null) {
            requestedDate = CurrentTimeProvider.today();
        }
        createdAt = CurrentTimeProvider.now();
        updatedAt = CurrentTimeProvider.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = CurrentTimeProvider.now();
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
    public VendorAmcContract getAmcContract() { return amcContract; }
    public void setAmcContract(VendorAmcContract amcContract) { this.amcContract = amcContract; }
    public Boolean getAmcCovered() { return amcCovered; }
    public void setAmcCovered(Boolean amcCovered) { this.amcCovered = amcCovered; }
    public Boolean getExternalVendorAssignment() { return externalVendorAssignment; }
    public void setExternalVendorAssignment(Boolean externalVendorAssignment) { this.externalVendorAssignment = externalVendorAssignment; }
    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }
    public String getVendorReferenceNumber() { return vendorReferenceNumber; }
    public void setVendorReferenceNumber(String vendorReferenceNumber) { this.vendorReferenceNumber = vendorReferenceNumber; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
