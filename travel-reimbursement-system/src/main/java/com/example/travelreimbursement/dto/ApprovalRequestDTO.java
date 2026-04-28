package com.example.travelreimbursement.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalRequestDTO {
    
    @NotBlank(message = "Comments are required")
    private String comments;
    
    // Default constructor
    public ApprovalRequestDTO() {
    }
    
    // All-args constructor
    public ApprovalRequestDTO(String comments) {
        this.comments = comments;
    }
    
    // Getters and Setters
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
}
