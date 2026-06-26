package com.example.cmmsApplication.approval.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;public class ApprovalDecisionDTO {
    private String comments;

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
