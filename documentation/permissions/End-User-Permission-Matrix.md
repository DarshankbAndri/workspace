# End-User Permission Matrix

> Extracted from the source-verified consolidated manual.

## 13. Permission Guide

| Feature | View | Create | Update | Delete | Special |
|---|---|---|---|---|---|
| Dashboard | `DASHBOARD_VIEW` | — | — | — | Role-configured widgets |
| Company | `COMPANY_VIEW` | `COMPANY_CREATE` | `COMPANY_UPDATE` | — | Logo upload follows save |
| Sites | `SITE_VIEW` | `SITE_CREATE` | `SITE_UPDATE` | `SITE_DELETE` | Site access applies |
| Employees | `EMPLOYEE_VIEW` | `EMPLOYEE_CREATE` | `EMPLOYEE_UPDATE` | `EMPLOYEE_DELETE` | Login/site/role assignment embedded |
| Roles | `ROLE_VIEW` | `ROLE_CREATE` | `ROLE_UPDATE` | `ROLE_DELETE` | Permission catalogue may also be required |
| Permissions | `PERMISSION_VIEW` | — | — | — | Read-only catalogue |
| User Roles | `USER_ROLE_VIEW` | — | `USER_ROLE_ASSIGN` | — | UI editor partial |
| Vendors | `VENDOR_VIEW` | `VENDOR_CREATE` | `VENDOR_UPDATE` | `VENDOR_DELETE` | — |
| Vendor AMC | `VENDOR_AMC_VIEW` | `VENDOR_AMC_CREATE` | `VENDOR_AMC_UPDATE` | `VENDOR_AMC_DELETE` | `VENDOR_AMC_ASSIGN_EQUIPMENT`, `VENDOR_AMC_RENEW` |
| Equipment | `EQUIPMENT_VIEW` | `EQUIPMENT_CREATE` | `EQUIPMENT_UPDATE` | `EQUIPMENT_DELETE` | — |
| Requests / PM | `REQUEST_VIEW` | `REQUEST_CREATE` | `REQUEST_UPDATE` | `REQUEST_DELETE` | `PM_CALENDAR_VIEW` for calendar |
| Assignments | `ASSIGNMENT_VIEW` | `ASSIGNMENT_CREATE` | `ASSIGNMENT_UPDATE` | `ASSIGNMENT_DELETE` | State/work-log/checklist APIs are mapped separately |
| Downtime | `DOWNTIME_VIEW` | `DOWNTIME_CREATE` | `DOWNTIME_UPDATE` | `DOWNTIME_DELETE` | Confirm, verify, close, reopen, RCA permissions |
| Spare Parts | `SPARE_PART_VIEW` | `SPARE_PART_CREATE` | `SPARE_PART_UPDATE` | `SPARE_PART_DELETE` | `STOCK_TRANSACTION_VIEW/CREATE` |
| Spare fulfilment | — | Request embedded | — | — | Manager approve, store process, reserve, issue, consume |
| Reorders | `REORDER_VIEW` | `REORDER_CREATE` | `REORDER_UPDATE` | — | Receipt/status actions use update mapping |
| Approvals | `APPROVAL_VIEW` | — | — | — | `APPROVAL_APPROVE`, `APPROVAL_REJECT` |
| Notifications | `NOTIFICATION_VIEW` | — | `NOTIFICATION_UPDATE` | — | Config uses `NOTIFICATION_CONFIG_VIEW/UPDATE` |
| Reports | `REPORT_VIEW` | — | — | — | Site access applies |

Backend access is checked separately using `api-permission-mapping.csv`; helper APIs needed for dropdowns must also be allowed. Site/record authorization may still deny an operation after permission passes.

