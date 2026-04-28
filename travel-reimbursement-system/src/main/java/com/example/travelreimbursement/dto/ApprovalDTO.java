package com.example.travelreimbursement.dto;

import com.example.travelreimbursement.entity.ApprovalStatus;
import com.example.travelreimbursement.entity.UserRole;

import java.time.LocalDateTime;

public class ApprovalDTO {
    
    private Long id;
    private Long claimId;
    private Long approverId;
    private UserRole role;
    private ApprovalStatus status;
    private String comments;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    
    // Default constructor
    public ApprovalDTO() {
    }
    
    // All-args constructor
    public ApprovalDTO(Long id, Long claimId, Long approverId, UserRole role,
                       ApprovalStatus status, String comments, LocalDateTime createdAt,
                       LocalDateTime approvedAt) {
        this.id = id;
        this.claimId = claimId;
        this.approverId = approverId;
        this.role = role;
        this.status = status;
        this.comments = comments;
        this.createdAt = createdAt;
        this.approvedAt = approvedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getClaimId() {
        return claimId;
    }
    
    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }
    
    public Long getApproverId() {
        return approverId;
    }
    
    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public ApprovalStatus getStatus() {
        return status;
    }
    
    public void setStatus(ApprovalStatus status) {
        this.status = status;
    }
    
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }
    
    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
}
