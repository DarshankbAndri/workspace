package com.example.cmmsApplication.approval.entity;


import com.example.cmmsApplication.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_action")
public class ApprovalAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_action_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_request_id", nullable = false)
    private ApprovalRequest approvalRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_user_id", nullable = false)
    private User approverUser;

    @Column(name = "action_status", nullable = false, length = 30)
    private String actionStatus;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "action_at", nullable = false)
    private LocalDateTime actionAt;

    @PrePersist
    public void onCreate() {
        if (actionAt == null) {
            actionAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ApprovalRequest getApprovalRequest() { return approvalRequest; }
    public void setApprovalRequest(ApprovalRequest approvalRequest) { this.approvalRequest = approvalRequest; }
    public User getApproverUser() { return approverUser; }
    public void setApproverUser(User approverUser) { this.approverUser = approverUser; }
    public String getActionStatus() { return actionStatus; }
    public void setActionStatus(String actionStatus) { this.actionStatus = actionStatus; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getActionAt() { return actionAt; }
    public void setActionAt(LocalDateTime actionAt) { this.actionAt = actionAt; }
}





