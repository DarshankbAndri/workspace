package com.example.cmmsApplication.common.config;


import com.example.cmmsApplication.notification.entity.Notification;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "cmms.notification")
public class NotificationProperties {
    private boolean enabled = true;
    private boolean inAppEnabled = true;
    private boolean emailEnabled = false;
    private boolean pmDueReminderEnabled = true;
    private boolean overdueRequestEnabled = true;
    private boolean approvalPendingEnabled = true;
    private int pmReminderDays = 3;
    private String scanCron = "0 0 7 * * *";
    private List<String> pmRecipientRoleCodes = new ArrayList<>(Arrays.asList("ADMIN", "SUPER_ADMIN", "MAINTENANCE_MANAGER"));
    private List<String> overdueRecipientRoleCodes = new ArrayList<>(Arrays.asList("ADMIN", "SUPER_ADMIN", "MAINTENANCE_MANAGER"));
    private List<String> approvalFallbackRoleCodes = new ArrayList<>(Arrays.asList("ADMIN", "SUPER_ADMIN"));
    private String fromAddress = "cmms@localhost";

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public boolean isInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }
    public boolean isEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(boolean emailEnabled) { this.emailEnabled = emailEnabled; }
    public boolean isPmDueReminderEnabled() { return pmDueReminderEnabled; }
    public void setPmDueReminderEnabled(boolean pmDueReminderEnabled) { this.pmDueReminderEnabled = pmDueReminderEnabled; }
    public boolean isOverdueRequestEnabled() { return overdueRequestEnabled; }
    public void setOverdueRequestEnabled(boolean overdueRequestEnabled) { this.overdueRequestEnabled = overdueRequestEnabled; }
    public boolean isApprovalPendingEnabled() { return approvalPendingEnabled; }
    public void setApprovalPendingEnabled(boolean approvalPendingEnabled) { this.approvalPendingEnabled = approvalPendingEnabled; }
    public int getPmReminderDays() { return pmReminderDays; }
    public void setPmReminderDays(int pmReminderDays) { this.pmReminderDays = pmReminderDays; }
    public String getScanCron() { return scanCron; }
    public void setScanCron(String scanCron) { this.scanCron = scanCron; }
    public List<String> getPmRecipientRoleCodes() { return pmRecipientRoleCodes; }
    public void setPmRecipientRoleCodes(List<String> pmRecipientRoleCodes) { this.pmRecipientRoleCodes = pmRecipientRoleCodes; }
    public List<String> getOverdueRecipientRoleCodes() { return overdueRecipientRoleCodes; }
    public void setOverdueRecipientRoleCodes(List<String> overdueRecipientRoleCodes) { this.overdueRecipientRoleCodes = overdueRecipientRoleCodes; }
    public List<String> getApprovalFallbackRoleCodes() { return approvalFallbackRoleCodes; }
    public void setApprovalFallbackRoleCodes(List<String> approvalFallbackRoleCodes) { this.approvalFallbackRoleCodes = approvalFallbackRoleCodes; }
    public String getFromAddress() { return fromAddress; }
    public void setFromAddress(String fromAddress) { this.fromAddress = fromAddress; }
}
