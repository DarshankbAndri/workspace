package com.example.cmmsApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_config", uniqueConstraints = @UniqueConstraint(columnNames = {"module_code", "action_code"}))
public class ApprovalConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long id;

    @Column(name = "module_code", nullable = false, length = 100)
    private String moduleCode;

    @Column(name = "action_code", nullable = false, length = 100)
    private String actionCode;

    @Column(name = "approval_required", nullable = false)
    private Boolean approvalRequired = false;

    @Column(name = "approver_role_code", length = 100)
    private String approverRoleCode;

    @Column(name = "min_approval_count", nullable = false)
    private Integer minApprovalCount = 1;

    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public String getActionCode() { return actionCode; }
    public void setActionCode(String actionCode) { this.actionCode = actionCode; }
    public Boolean getApprovalRequired() { return approvalRequired; }
    public void setApprovalRequired(Boolean approvalRequired) { this.approvalRequired = approvalRequired; }
    public String getApproverRoleCode() { return approverRoleCode; }
    public void setApproverRoleCode(String approverRoleCode) { this.approverRoleCode = approverRoleCode; }
    public Integer getMinApprovalCount() { return minApprovalCount; }
    public void setMinApprovalCount(Integer minApprovalCount) { this.minApprovalCount = minApprovalCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
