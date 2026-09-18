package com.example.cmmsApplication.notification.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import com.example.cmmsApplication.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "notification_setting")
@Getter
@Setter
@NoArgsConstructor
public class NotificationSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Long id;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    private Boolean inAppEnabled = true;

    @Column(name = "email_enabled")
    private Boolean emailEnabled = false;

    @Column(name = "pm_due_reminder_enabled", nullable = false)
    private Boolean pmDueReminderEnabled = true;

    @Column(name = "overdue_request_enabled", nullable = false)
    private Boolean overdueRequestEnabled = true;

    @Column(name = "approval_pending_enabled", nullable = false)
    private Boolean approvalPendingEnabled = true;

    @Column(name = "pm_reminder_days", nullable = false)
    private Integer pmReminderDays = 3;

    @Column(name = "scan_cron", nullable = false, length = 120)
    private String scanCron = "0 0 7 * * *";

    @Column(name = "pm_recipient_role_codes", length = 1000)
    private String pmRecipientRoleCodes;

    @Column(name = "overdue_recipient_role_codes", length = 1000)
    private String overdueRecipientRoleCodes;

    @Column(name = "approval_fallback_role_codes", length = 1000)
    private String approvalFallbackRoleCodes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = CurrentTimeProvider.now();
        updatedAt = CurrentTimeProvider.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = CurrentTimeProvider.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Boolean getInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(Boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }
    public Boolean getEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(Boolean emailEnabled) { this.emailEnabled = emailEnabled; }
    public Boolean getPmDueReminderEnabled() { return pmDueReminderEnabled; }
    public void setPmDueReminderEnabled(Boolean pmDueReminderEnabled) { this.pmDueReminderEnabled = pmDueReminderEnabled; }
    public Boolean getOverdueRequestEnabled() { return overdueRequestEnabled; }
    public void setOverdueRequestEnabled(Boolean overdueRequestEnabled) { this.overdueRequestEnabled = overdueRequestEnabled; }
    public Boolean getApprovalPendingEnabled() { return approvalPendingEnabled; }
    public void setApprovalPendingEnabled(Boolean approvalPendingEnabled) { this.approvalPendingEnabled = approvalPendingEnabled; }
    public Integer getPmReminderDays() { return pmReminderDays; }
    public void setPmReminderDays(Integer pmReminderDays) { this.pmReminderDays = pmReminderDays; }
    public String getScanCron() { return scanCron; }
    public void setScanCron(String scanCron) { this.scanCron = scanCron; }
    public String getPmRecipientRoleCodes() { return pmRecipientRoleCodes; }
    public void setPmRecipientRoleCodes(String pmRecipientRoleCodes) { this.pmRecipientRoleCodes = pmRecipientRoleCodes; }
    public String getOverdueRecipientRoleCodes() { return overdueRecipientRoleCodes; }
    public void setOverdueRecipientRoleCodes(String overdueRecipientRoleCodes) { this.overdueRecipientRoleCodes = overdueRecipientRoleCodes; }
    public String getApprovalFallbackRoleCodes() { return approvalFallbackRoleCodes; }
    public void setApprovalFallbackRoleCodes(String approvalFallbackRoleCodes) { this.approvalFallbackRoleCodes = approvalFallbackRoleCodes; }
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
