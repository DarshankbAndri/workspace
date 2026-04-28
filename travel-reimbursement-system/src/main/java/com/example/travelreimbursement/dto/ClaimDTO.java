package com.example.travelreimbursement.dto;

import com.example.travelreimbursement.entity.ClaimStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Data Transfer Object for Travel Claim information")
public class ClaimDTO {
    
    @Schema(description = "Claim ID", example = "1")
    private Long id;
    
    @NotBlank(message = "Description is required")
    @Schema(description = "Travel claim description", example = "Flight and accommodation for New York conference")
    private String description;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    @Schema(description = "Claim amount", example = "2500.00")
    private BigDecimal amount;
    
    @Schema(description = "Current claim status", example = "DRAFT")
    private ClaimStatus status;
    
    @Schema(description = "Rejection reason if rejected")
    private String rejectionReason;
    
    @Schema(description = "User ID who submitted the claim", example = "1")
    private Long userId;
    
    @Schema(description = "Manager ID for approval", example = "2")
    private Long managerId;
    
    @Schema(description = "Claim creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Claim submission timestamp")
    private LocalDateTime submittedAt;
    
    @Schema(description = "Manager approval timestamp")
    private LocalDateTime approvedAt;
    
    @Schema(description = "Payment completion timestamp")
    private LocalDateTime paidAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public ClaimDTO() {
    }
    
    // All-args constructor
    public ClaimDTO(Long id, String description, BigDecimal amount, ClaimStatus status,
                    String rejectionReason, Long userId, Long managerId, LocalDateTime createdAt,
                    LocalDateTime submittedAt, LocalDateTime approvedAt, LocalDateTime paidAt,
                    LocalDateTime updatedAt) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.userId = userId;
        this.managerId = managerId;
        this.createdAt = createdAt;
        this.submittedAt = submittedAt;
        this.approvedAt = approvedAt;
        this.paidAt = paidAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public ClaimStatus getStatus() {
        return status;
    }
    
    public void setStatus(ClaimStatus status) {
        this.status = status;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getManagerId() {
        return managerId;
    }
    
    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }
    
    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
