package com.example.cmmsApplication.approval.entity;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "approval_request")
@Getter
@Setter
@NoArgsConstructor
public class ApprovalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_request_id")
    private Long id;

    @Column(name = "module_code", nullable = false, length = 100)
    private String moduleCode;

    @Column(name = "action_code", nullable = false, length = 100)
    private String actionCode;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "approval_status", nullable = false, length = 30)
    private String approvalStatus = "PENDING";

    @Column(name = "approver_role_code", length = 100)
    private String approverRoleCode;

    @Column(name = "min_approval_count", nullable = false)
    private Integer minApprovalCount = 1;

    @Column(name = "approved_count", nullable = false)
    private Integer approvedCount = 0;

    @Column(name = "rejected_count", nullable = false)
    private Integer rejectedCount = 0;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "payload_json", columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
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
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public String getActionCode() { return actionCode; }
    public void setActionCode(String actionCode) { this.actionCode = actionCode; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }
    public Site getSite() { return site; }
    public void setSite(Site site) { this.site = site; }
    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getApproverRoleCode() { return approverRoleCode; }
    public void setApproverRoleCode(String approverRoleCode) { this.approverRoleCode = approverRoleCode; }
    public Integer getMinApprovalCount() { return minApprovalCount; }
    public void setMinApprovalCount(Integer minApprovalCount) { this.minApprovalCount = minApprovalCount; }
    public Integer getApprovedCount() { return approvedCount; }
    public void setApprovedCount(Integer approvedCount) { this.approvedCount = approvedCount; }
    public Integer getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(Integer rejectedCount) { this.rejectedCount = rejectedCount; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
