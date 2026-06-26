package com.example.cmmsApplication.dto;

import java.time.LocalDateTime;

public class ApprovalConfigDTO {
    private Long id;
    private String moduleCode;
    private String actionCode;
    private Boolean approvalRequired;
    private String approverRoleCode;
    private Integer minApprovalCount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
