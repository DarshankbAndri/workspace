> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 21. Notification Configuration

**Route:** `/admin/notification-settings`  
**Permissions:** `NOTIFICATION_CONFIG_VIEW`, `NOTIFICATION_CONFIG_UPDATE`.

| Field | Mapping | Required/default | Purpose/validation |
|---|---|---|---|
| Notifications Enabled | `enabled` | Boolean | Global notification switch. |
| In-App Notifications | `inAppEnabled` | Boolean | Enables notification-center messages. |
| Email Notifications | `emailEnabled` | Boolean | Enables email channel; SMTP must be configured. |
| PM Due Reminders | `pmDueReminderEnabled` | Boolean | Sends upcoming-PM alerts. |
| Overdue Request Alerts | `overdueRequestEnabled` | Boolean | Sends overdue request alerts. |
| Approval Pending Alerts | `approvalPendingEnabled` | Boolean | Sends pending approval alerts. |
| PM Reminder Days | `pmReminderDays` | Number | Lead days; non-negative/service validated. |
| Daily Scan Time | `dailyScanTime` | Time | UI configuration value for scan time; deployment cron behavior must be verified when changed. |
| PM Recipient Roles | `pmRecipientRoleCodes[]` | Multi-select | Roles receiving PM reminders. |
| Overdue Recipient Roles | `overdueRecipientRoleCodes[]` | Multi-select | Roles receiving overdue alerts. |
| Approval Fallback Roles | `approvalFallbackRoleCodes[]` | Multi-select | Recipients when configured approver cannot be resolved. |

GET/PUT `/api/admin/notification-settings`. Role options come from role service. Save remains on page and refreshes returned settings. Settings table/entity stores configuration; application properties provide defaults.

---

