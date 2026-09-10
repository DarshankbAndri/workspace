# RBAC Test Matrix

Actual roles: `SUPER_ADMIN`, `ADMIN`, `HR_ADMIN`, `MAINTENANCE_MANAGER`, `SITE_MANAGER`, `TECHNICIAN`, `VIEWER`.

`SUPER_ADMIN` and `ADMIN` receive all permission codes. Other expectations below come from Liquibase role-permission data. Site access is an additional requirement even when the permission is allowed.

Legend: A = allowed when site scope also permits; D = denied; R = read-only operation.

| API family | HTTP methods | Permission(s) | SUPER_ADMIN | HR_ADMIN | MAINTENANCE_MANAGER | SITE_MANAGER | TECHNICIAN | VIEWER |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/hr/sites` | GET/POST/PUT/DELETE | SITE_* | A | A | D | D | D | R |
| `/api/hr/employees` | GET/POST/PUT/DELETE | EMPLOYEE_* | A | A | D | D | D | R |
| `/api/admin/roles` | GET/POST/PUT/DELETE | ROLE_* | A | D | D | D | D | D |
| `/api/admin/permissions` | GET | PERMISSION_VIEW | A | D | D | D | D | D |
| `/api/admin/users/*/roles` | GET/PUT | USER_ROLE_VIEW/UPDATE | A | assign only | D | D | D | D |
| `/api/company/**` | GET/POST/PUT | COMPANY_* | A | D | D | D | D | D |
| `/api/equipment` | GET/POST/PUT/DELETE | EQUIPMENT_* | A | D | R | A except delete | R | R |
| `/api/equipment/*/documents` | GET/POST/DELETE | EQUIPMENT_VIEW/UPDATE/DELETE | A | D | R/upload | R/upload | R | R |
| `/api/maintenance/requests` | GET/POST/PUT/DELETE | REQUEST_* | A | D | A except delete | A except delete | R/update transition | R |
| `/api/approvals` | GET/POST | APPROVAL_VIEW/APPROVE/REJECT | A | D | A | A | D | D |
| `/api/admin/approval-config` | GET/POST/PUT | APPROVAL_CONFIG_* | A | D | D | D | D | D |
| `/api/maintenance/assignments` | GET/POST/PUT/DELETE | ASSIGNMENT_* | A | D | A except delete | A except delete | own read/work | R |
| assignment checklist | GET/POST/PUT/DELETE | ASSIGNMENT_CHECKLIST_* | A | D | A | A | view/update/upload | D |
| assignment work logs | GET/POST/PUT/DELETE | ASSIGNMENT_WORK_LOG_* | A | D | A | A | view/create/update/upload | D |
| `/api/maintenance/downtime` | GET/POST/PUT/DELETE/actions | DOWNTIME_* | A | D | view/create/update | view/create/update | view/create | R |
| `/api/spare-parts` | GET/POST/PUT/DELETE | SPARE_PART_* | A | D | view/create/update | view/create/update | R | R |
| stock transactions | GET/POST | STOCK_TRANSACTION_* | A | D | A | A | R | R |
| spare usage workflow | GET/POST/PUT/DELETE | SPARE_USAGE_* | A | D | A | A | view/create/consume | R |
| `/api/spare-part-reorders` | GET/POST/PUT | REORDER_* | A | D | A | A | R | R |
| PM schedules/calendar | GET/POST/PUT/DELETE/generate | REQUEST_*, PM_CALENDAR_VIEW | A | D | A except delete | A except delete | R | R |
| `/api/vendors` | GET/POST/PUT/DELETE | VENDOR_* | A | D | R | R | D | R |
| `/api/vendor-amc` | GET/POST/PUT/DELETE/actions | VENDOR_AMC_* | A | D | A | A | R | R |
| `/api/notifications` | GET/PUT | authenticated owner | A | A | A | A | A | A |
| notification settings | GET/PUT | NOTIFICATION_CONFIG_VIEW/UPDATE | A | D | D | D | D | D |
| `/api/reports/**` | GET | REPORT_VIEW | A | D | A | A | D | A |
| `/api/dashboard/**` | GET | dashboard/module widget permission | A | dashboard only | permitted modules | permitted modules | permitted modules | read modules |

The automation reads `api-permission-mapping.csv` and fails when a protected OpenAPI operation is unmapped. Endpoint-level generated output is written to `API_TEST_COVERAGE.md`.
