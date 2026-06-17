# Notification Configuration

This application has a configurable notification system for:

- Due preventive maintenance reminders
- Overdue maintenance request alerts
- Approval pending alerts
- In-app notification history
- Optional email notification delivery

Runtime notification behavior is configured in the CMMS UI:

```text
Admin > Notification Settings
```

The backend also keeps startup defaults in:

```properties
cmms_back_end/src/main/resources/application.properties
```

Those properties are used only when the `notification_setting` database table is empty. On first startup, the application seeds one settings row from `application.properties`. After that, UI/database values are the source of truth for notification behavior.

## Current Configuration

These are the startup defaults:

```properties
cmms.notification.enabled=true
cmms.notification.in-app-enabled=true
cmms.notification.email-enabled=false
cmms.notification.pm-due-reminder-enabled=true
cmms.notification.overdue-request-enabled=true
cmms.notification.approval-pending-enabled=true
cmms.notification.pm-reminder-days=3
cmms.notification.scan-cron=0 0 7 * * *
cmms.notification.pm-recipient-role-codes=ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER
cmms.notification.overdue-recipient-role-codes=ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER
cmms.notification.approval-fallback-role-codes=ADMIN,SUPER_ADMIN
cmms.notification.from-address=cmms@localhost
```

The UI does not edit SMTP/server email settings. Email delivery stays controlled by `cmms.notification.email-enabled`, `cmms.notification.from-address`, and the `spring.mail.*` properties in `application.properties`.

## Property Details

| Property | Default | What It Controls |
| --- | --- | --- |
| `cmms.notification.enabled` | `true` | Startup default for the master switch. Runtime value is editable in the UI. |
| `cmms.notification.in-app-enabled` | `true` | Startup default for notification records in the bell and `/notifications`. Runtime value is editable in the UI. |
| `cmms.notification.email-enabled` | `false` | Server-side email delivery switch. Not editable in the UI. |
| `cmms.notification.pm-due-reminder-enabled` | `true` | Startup default for scheduled PM due reminders. Runtime value is editable in the UI. |
| `cmms.notification.overdue-request-enabled` | `true` | Startup default for overdue request alerts. Runtime value is editable in the UI. |
| `cmms.notification.approval-pending-enabled` | `true` | Startup default for approval pending alerts. Runtime value is editable in the UI. |
| `cmms.notification.pm-reminder-days` | `3` | Startup default for PM reminder lookahead days. Runtime value is editable in the UI. |
| `cmms.notification.scan-cron` | `0 0 7 * * *` | Startup default for scheduled scans. In the UI this is shown as a daily scan time, and the backend converts that time to cron internally. |
| `cmms.notification.pm-recipient-role-codes` | `ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER` | Startup default role list for PM due reminders. Runtime value is editable in the UI. |
| `cmms.notification.overdue-recipient-role-codes` | `ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER` | Startup default role list for overdue alerts. Runtime value is editable in the UI. |
| `cmms.notification.approval-fallback-role-codes` | `ADMIN,SUPER_ADMIN` | Startup default fallback roles for approval alerts. Runtime value is editable in the UI. |
| `cmms.notification.from-address` | `cmms@localhost` | Server-side sender email address used when email delivery is enabled. Not editable in the UI. |

## Admin UI

Use this page to change runtime notification settings:

```text
Admin > Notification Settings
```

Backend API:

```text
GET /api/admin/notification-settings
PUT /api/admin/notification-settings
```

Permissions:

```text
NOTIFICATION_CONFIG_VIEW
NOTIFICATION_CONFIG_UPDATE
```

The page supports:

- Global notification enable/disable
- In-app notification enable/disable
- PM due reminder enable/disable
- Overdue request alert enable/disable
- Approval pending alert enable/disable
- PM reminder days
- Daily scan time
- PM recipient roles
- Overdue alert recipient roles
- Approval fallback roles

## How Each Notification Type Works

## PM Due Reminder

Controlled by:

```properties
cmms.notification.enabled=true
cmms.notification.pm-due-reminder-enabled=true
cmms.notification.pm-reminder-days=3
cmms.notification.scan-cron=0 0 7 * * *
cmms.notification.pm-recipient-role-codes=ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER
```

Workflow:

1. Scheduler runs based on the configured daily scan time.
2. System checks active PM schedules where `nextDueDate` is between today and `today + pm-reminder-days`.
3. It skips PM schedules with `PENDING_APPROVAL` or `REJECTED` status.
4. It creates notification records for users with configured PM recipient roles.
5. Users see alerts in the notification bell and `/notifications`.

Example:

```text
PM schedule PM-1001 is due on 2026-06-20.
Today is 2026-06-17.
pm-reminder-days = 3.
The system creates a PM due reminder.
```

## Overdue Request Alert

Controlled by:

```properties
cmms.notification.enabled=true
cmms.notification.overdue-request-enabled=true
cmms.notification.scan-cron=0 0 7 * * *
cmms.notification.overdue-recipient-role-codes=ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER
```

Workflow:

1. Scheduler runs based on the configured daily scan time.
2. System checks maintenance requests where `targetCompletionDate` is before today.
3. It ignores requests with status `CLOSED`, `COMPLETED`, `CANCELLED`, or `REJECTED`.
4. It creates notification records for users with configured overdue recipient roles.
5. Users can open the notification and navigate to the request view page.

Example:

```text
Request MR-1005 target completion date was 2026-06-15.
Today is 2026-06-17.
Status is OPEN.
The system creates an overdue request alert.
```

## Approval Pending Alert

Controlled by:

```properties
cmms.notification.enabled=true
cmms.notification.approval-pending-enabled=true
cmms.notification.approval-fallback-role-codes=ADMIN,SUPER_ADMIN
```

Workflow:

1. Existing approval workflow creates an `ApprovalRequest`.
2. Notification service checks the approval request's `approverRoleCode`.
3. If `approverRoleCode` exists, users with that role receive the notification.
4. If `approverRoleCode` is blank, users with `approval-fallback-role-codes` receive it.
5. User clicks the notification and goes to `/approvals/pending`.

Example:

```text
PM schedule creation requires approval.
Approval request has approverRoleCode = MAINTENANCE_MANAGER.
Users with MAINTENANCE_MANAGER role receive an approval pending notification.
```

## In-App Notifications

Controlled by:

```properties
cmms.notification.in-app-enabled=true
```

When enabled:

- Notification rows are saved in the `notification` table.
- Users see unread count in the frontend notification bell.
- Users can open `/notifications`.
- Users can mark notifications as read.
- Users can archive notifications.

When disabled:

- New in-app notification records are not created.
- Email can still be used only if `email-enabled=true`.

## Email Notifications

Controlled by:

```properties
cmms.notification.email-enabled=false
cmms.notification.from-address=cmms@localhost
```

Email is disabled by default. To enable it, configure SMTP properties and then set email enabled to `true`.

Example SMTP configuration:

```properties
cmms.notification.email-enabled=true
cmms.notification.from-address=cmms@example.com

spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=your_user
spring.mail.password=your_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

Behavior:

- If email is disabled, notification `emailStatus` is `NOT_REQUIRED`.
- If email is enabled, notification starts as `PENDING`.
- If sending succeeds, `emailStatus` becomes `SENT`.
- If sending fails or SMTP is unavailable, `emailStatus` becomes `FAILED`.
- The in-app notification still exists even if email fails.

## Recipient Role-Code Lists

These properties decide who receives notifications:

```properties
cmms.notification.pm-recipient-role-codes=ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER
cmms.notification.overdue-recipient-role-codes=ADMIN,SUPER_ADMIN,MAINTENANCE_MANAGER
cmms.notification.approval-fallback-role-codes=ADMIN,SUPER_ADMIN
```

Rules:

- Values are comma-separated role codes.
- Role codes must match `role_master.role_code`.
- Users are matched through active `user_role` records.
- Site-specific notifications are filtered by site where possible.
- Legacy `UserRole.ADMIN` users are also included when `ADMIN` or `SUPER_ADMIN` is configured.

Example:

```properties
cmms.notification.pm-recipient-role-codes=MAINTENANCE_MANAGER,PLANT_HEAD
```

This sends PM due reminders to users with `MAINTENANCE_MANAGER` or `PLANT_HEAD` role assignments.

## Daily Scan Time Examples

Admins do not enter cron expressions in the UI. They select a daily time in `HH:mm` format.

Run daily at 7:00 AM:

```text
07:00
```

Run daily at 9:30 AM:

```text
09:30
```

Run daily at 5:45 PM:

```text
17:45
```

The backend converts the selected time into a Spring cron expression internally.

Example:

```text
09:30 -> 0 30 9 * * *
```

## Common Configuration Scenarios

Disable all notifications:

```properties
cmms.notification.enabled=false
```

Use only in-app notifications:

```properties
cmms.notification.enabled=true
cmms.notification.in-app-enabled=true
cmms.notification.email-enabled=false
```

Use in-app and email notifications:

```properties
cmms.notification.enabled=true
cmms.notification.in-app-enabled=true
cmms.notification.email-enabled=true
```

Disable only PM due reminders:

```properties
cmms.notification.pm-due-reminder-enabled=false
```

Disable only overdue request alerts:

```properties
cmms.notification.overdue-request-enabled=false
```

Disable only approval pending alerts:

```properties
cmms.notification.approval-pending-enabled=false
```

Increase PM reminder window to 7 days:

```properties
cmms.notification.pm-reminder-days=7
```

## Important Notes

- Restart the backend after changing `application.properties`; these values only seed the first database settings row.
- Scheduled PM due and overdue scans are controlled by the daily scan time in `Admin > Notification Settings`.
- Approval pending notifications are created immediately when the approval workflow creates an approval request.
- Duplicate daily PM/overdue notifications are prevented with a dedupe key.
- Notification records are personal to the recipient user.
- Users can only read, mark, or archive their own notifications.
