> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 8. Approvals and Notifications

### Approval inbox and history

**Where:** Approvals → Pending Approvals / Approval History · **Permissions:** `APPROVAL_VIEW`, `APPROVAL_APPROVE`, `APPROVAL_REJECT`.

Filter pending work by module, action, site, status, and request date. Select **View** to inspect reference, requester, and remarks. Approve when the request is valid and within authority; reject with an actionable reason. The decision leaves the inbox and appears in history. Approval configuration controls module/action behavior and approver role where implemented.

**Administration → Approval Configuration:** `APPROVAL_CONFIG_VIEW/UPDATE`. The page edits configured approval rows. Creation exists at service level but the present UI is primarily edit-oriented.

### Notification center

**Where:** bell or `/notifications` · **Permissions:** `NOTIFICATION_VIEW`, update actions with `NOTIFICATION_UPDATE`.

Use tabs for All, Unread, Read, Archived, PM, Overdue, Approval, and High Priority. Opening an unread item can mark it read; use **Mark All Read** or archive when permitted. The application supports live event-stream updates when the connection is available.

Notification Settings (`NOTIFICATION_CONFIG_VIEW/UPDATE`) configure event/role/channel behavior. Current notification types include PM due reminders, overdue requests, approval pending, and other configured workflow events. Email works only when server SMTP and settings are enabled; users cannot configure SMTP secrets in the UI. Low-stock and AMC expiry are visible in dashboard features and may produce notifications only where the backend event is configured.

