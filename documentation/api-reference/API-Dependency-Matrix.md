# CMMS Creation Page API Dependency Matrix

Source of truth: `cmms_back_end/src/main/resources/api-permission-mapping.csv` and current frontend services. Paths include the `/api` context.

| Page permission | Required API | Method | Purpose |
|---|---|---|---|
| `COMPANY_VIEW` | `/api/company/current` | GET | Load company profile |
| `COMPANY_CREATE` | `/api/company/create` | POST | Create initial company |
| `COMPANY_UPDATE` | `/api/company/update/{id}` | PUT | Update company |
| `COMPANY_UPDATE` | `/api/company/upload-logo` | POST | Upload logo |
| `SITE_VIEW/CREATE/UPDATE` | `/api/hr/sites`, `/api/hr/sites/{id}` | GET/POST/PUT | Load/create/update sites |
| `EMPLOYEE_VIEW/CREATE/UPDATE` | `/api/hr/employees`, `/api/hr/employees/{id}` | GET/POST/PUT | Employee and linked login/assignment operations |
| Employee page permission | `/api/hr/sites` | GET | Site assignment dropdown |
| `ROLE_VIEW/CREATE/UPDATE` | `/api/admin/roles`, `/api/admin/roles/{id}` | GET/POST/PUT | Role operations |
| `PERMISSION_VIEW` | `/api/admin/permissions` | GET | Permission selector |
| `USER_ROLE_ASSIGN` | `/api/users` | POST | Create account |
| `USER_ROLE_VIEW/UPDATE` | `/api/admin/users/{id}/roles` | GET/PUT | User role assignment API (UI placeholder) |
| `VENDOR_VIEW/CREATE/UPDATE` | `/api/vendors`, `/api/vendors/{id}` | GET/POST/PUT | Vendor operations |
| Vendor page permission | `/api/hr/sites` | GET | Vendor site dropdown |
| `VENDOR_AMC_CREATE/UPDATE` | `/api/vendor-amc`, `/api/vendor-amc/{id}` | POST/PUT | AMC contract save |
| `VENDOR_AMC_ASSIGN_EQUIPMENT` | `/api/vendor-amc/{id}/equipment` | POST/DELETE | Synchronize covered assets |
| AMC page permission | `/api/vendors`, `/api/equipment`, `/api/hr/sites` | GET | AMC dropdowns |
| `EQUIPMENT_CREATE/UPDATE` | `/api/equipment`, `/api/equipment/{id}` | POST/PUT | Equipment save |
| Equipment page permission | `/api/hr/sites` | GET | Equipment site dropdown |
| `EQUIPMENT_UPDATE` | `/api/equipment/{id}/documents` | POST | Equipment document upload |
| `EQUIPMENT_UPDATE` | `/api/equipment/{id}/spare-bom` | POST | Equipment BOM add |
| `REQUEST_CREATE/UPDATE` | `/api/maintenance/requests`, `/api/maintenance/requests/{id}` | POST/PUT | Request save |
| Request page permission | `/api/hr/sites`, `/api/equipment` | GET | Request dropdowns |
| Request page permission | `/api/equipment/{id}/active-amc` | GET | AMC lookup |
| `REQUEST_UPDATE` | `/api/maintenance/requests/{id}/transition` | POST | Request status action |
| `ASSIGNMENT_CREATE/UPDATE` | `/api/maintenance/assignments`, `/api/maintenance/assignments/{id}` | POST/PUT | Assignment save |
| Assignment page permission | `/api/hr/sites`, `/api/maintenance/requests`, `/api/vendors` | GET | Assignment dropdowns |
| `ASSIGNMENT_CHECKLIST_UPDATE` | `/api/maintenance/assignments/{id}/checklist/**` | POST/PUT/DELETE | Checklist and proof writes |
| `ASSIGNMENT_WORK_LOG_CREATE/UPDATE/DELETE` | `/api/maintenance/assignments/{id}/work-logs/**` | POST/PUT/DELETE | Work logs/attachments |
| `DOWNTIME_CREATE/UPDATE` | `/api/maintenance/downtime`, `/api/maintenance/downtime/{id}` | POST/PUT | Downtime save |
| Downtime page permission | `/api/equipment`, `/api/maintenance/requests` | GET | Downtime dropdowns |
| `DOWNTIME_CONFIRM/VERIFY/CLOSE/REOPEN` | `/api/maintenance/downtime/{id}/{action}` | POST | Downtime lifecycle |
| `DOWNTIME_RCA_MANAGE` | `/api/maintenance/downtime/{id}/rca-actions/**` | POST/PUT | RCA actions |
| `REQUEST_CREATE/UPDATE` | `/api/preventive-maintenance/schedules`, `/api/preventive-maintenance/schedules/{id}` | POST/PUT | PM schedule save |
| `REQUEST_CREATE` | `/api/preventive-maintenance/schedules/{id}/generate-work-order` | POST | Generate PM work order |
| `SPARE_PART_CREATE/UPDATE` | `/api/spare-parts`, `/api/spare-parts/{stockId}` | POST/PUT | Spare master/site stock save |
| Spare page permission | `/api/hr/sites`, `/api/equipment` | GET | Spare/BOM dropdowns |
| `STOCK_TRANSACTION_CREATE` | `/api/spare-parts/{stockId}/stock-in` | POST | Stock receipt |
| `STOCK_TRANSACTION_CREATE` | `/api/spare-parts/{stockId}/adjust` | POST | Balance adjustment |
| `STOCK_TRANSACTION_CREATE` | `/api/spare-parts/{stockId}/transfer` | POST | Inter-site transfer |
| `SPARE_USAGE_CREATE/UPDATE` | `/api/maintenance/assignments/{id}/spares/**` | POST/PUT | Request/edit spare |
| `SPARE_USAGE_MANAGER_APPROVE` | `/api/spare-requests/{id}/manager-approve|manager-reject` | POST | Manager decision |
| `SPARE_USAGE_STORE_PROCESS` | `/api/spare-requests/{id}/check-stock` | POST | Stock availability decision |
| `SPARE_USAGE_RESERVE/ISSUE/CONSUME/RETURN` | `/api/spare-requests/{id}/{action}` | POST | Fulfilment/usage |
| `REORDER_CREATE/UPDATE` | `/api/spare-part-reorders`, `/api/spare-part-reorders/{id}` | POST/PUT | Reorder save |
| `REORDER_UPDATE` | `/api/spare-part-reorders/{id}/receive-stock` | POST | Purchase receipt |
| `APPROVAL_CONFIG_VIEW/UPDATE` | `/api/admin/approval-config/**` | GET/POST/PUT | Approval configuration |
| `APPROVAL_APPROVE/REJECT` | `/api/approvals/{id}/approve|reject` | POST | Approval decision |
| `NOTIFICATION_CONFIG_VIEW/UPDATE` | `/api/admin/notification-settings` | GET/PUT | Notification configuration |

## Mapping gaps to verify

1. Employee create/edit loads roles, but employee permissions do not explicitly include role helper API rows.
2. Role create/edit loads permissions, but role write permissions do not explicitly include permission helper API rows.
3. Notification settings loads roles, but notification configuration permissions do not explicitly include role helper rows.
4. Proof/attachment-specific UI permission names do not match broader CSV permission codes.

