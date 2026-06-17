package com.example.cmmsApplication.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NotificationSettingDTO {
    private Long id;
    private Boolean enabled;
    private Boolean inAppEnabled;
    private Boolean pmDueReminderEnabled;
    private Boolean overdueRequestEnabled;
    private Boolean approvalPendingEnabled;
    private Integer pmReminderDays;
    private String scanCron;
    private String scanTime;
    private List<String> pmRecipientRoleCodes = new ArrayList<>();
    private List<String> overdueRecipientRoleCodes = new ArrayList<>();
    private List<String> approvalFallbackRoleCodes = new ArrayList<>();
    private Long updatedById;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Boolean getInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(Boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }
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
    public String getScanTime() { return scanTime; }
    public void setScanTime(String scanTime) { this.scanTime = scanTime; }
    public List<String> getPmRecipientRoleCodes() { return pmRecipientRoleCodes; }
    public void setPmRecipientRoleCodes(List<String> pmRecipientRoleCodes) { this.pmRecipientRoleCodes = pmRecipientRoleCodes; }
    public List<String> getOverdueRecipientRoleCodes() { return overdueRecipientRoleCodes; }
    public void setOverdueRecipientRoleCodes(List<String> overdueRecipientRoleCodes) { this.overdueRecipientRoleCodes = overdueRecipientRoleCodes; }
    public List<String> getApprovalFallbackRoleCodes() { return approvalFallbackRoleCodes; }
    public void setApprovalFallbackRoleCodes(List<String> approvalFallbackRoleCodes) { this.approvalFallbackRoleCodes = approvalFallbackRoleCodes; }
    public Long getUpdatedById() { return updatedById; }
    public void setUpdatedById(Long updatedById) { this.updatedById = updatedById; }
    public String getUpdatedByName() { return updatedByName; }
    public void setUpdatedByName(String updatedByName) { this.updatedByName = updatedByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
