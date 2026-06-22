package com.example.cmmsApplication.approval.dto;

import java.time.LocalDateTime;

public class ApprovalActionDTO {
    private Long id;
    private Long approvalRequestId;
    private Long approverUserId;
    private String approverName;
    private String actionStatus;
    private String comments;
    private LocalDateTime actionAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getApprovalRequestId() { return approvalRequestId; }
    public void setApprovalRequestId(Long approvalRequestId) { this.approvalRequestId = approvalRequestId; }
    public Long getApproverUserId() { return approverUserId; }
    public void setApproverUserId(Long approverUserId) { this.approverUserId = approverUserId; }
    public String getApproverName() { return approverName; }
    public void setApproverName(String approverName) { this.approverName = approverName; }
    public String getActionStatus() { return actionStatus; }
    public void setActionStatus(String actionStatus) { this.actionStatus = actionStatus; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getActionAt() { return actionAt; }
    public void setActionAt(LocalDateTime actionAt) { this.actionAt = actionAt; }
}




