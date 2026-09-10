# CMMS End-to-End Test Coverage Matrix

Source of truth: React routes and service calls, Spring controllers/services, `api-permission-mapping.csv`, Liquibase, and the live OpenAPI contract. Future-only documentation is excluded.

| Module | Feature | UI Page | API | Role | Site Scoped | Positive Test | Negative Test | Implemented Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Startup | Frontend/backend/DB readiness | `/login` | health, `/system/time` | Public | No | Reachability and business query | Protected API without JWT | startup/smoke |
| Auth | Login and current access | `/login` | `/auth/login`, `/auth/me` | All users | Effective sites | Valid credentials and redirect | bad/empty user, bad/expired JWT | auth/authentication |
| Auth | Logout/session removal | all protected routes | `/auth/logout` | All users | No | Clear session and redirect | reuse removed token | auth/authentication |
| Company | Current company | `/admin/company` | `/company/current`, create/update/logo | Admin | No | view/contract | invalid payload/unauthorized | UI/contract only (partial) |
| Site | Site lifecycle | `/hr/sites` | `/hr/sites`, `/hr/sites/search` | Admin, HR | Yes | create/view/update/search/delete | duplicate/invalid/forbidden | site/site-crud |
| Site | Cross-site isolation | protected pages | site-aware APIs | Scoped roles | Yes | own-site CRUD | SITE-A token accesses SITE-B | security/cross-site-security |
| Employee | Employee lifecycle | `/hr/employees` | `/hr/employees`, search | Admin, HR | Yes | sites/roles/status CRUD | duplicate/email/invalid site | employee/employee-crud |
| User | User/account mapping | `/create-user` | `/users`, user roles | Admin, HR | Yes | employee/login mapping | duplicate/disabled login | UI/contract only (partial) |
| Role | Role lifecycle | `/admin/roles` | `/admin/roles`, search | Admin | No | permission add/remove | duplicate/unauthorized | role/role-permission |
| Permission | Permission catalog/enforcement | `/admin/permissions` | `/admin/permissions`, mapped APIs | Admin | Mixed | allowed action succeeds | missing permission gets 403 | security/rbac |
| User role | Effective role changes | `/admin/user-roles` | `/admin/users/{id}/roles` | Admin | Yes | assign and re-authenticate | remove and deny | account-dependent (partial) |
| Equipment | Asset lifecycle | `/equipment` | `/equipment`, search, summary, health | Asset roles | Yes | CRUD/filter/sort/paging | duplicate/invalid/cross-site | equipment/equipment |
| Equipment | Documents | equipment view | documents upload/file/delete | Asset roles | Yes | PDF upload/download/delete | invalid type/unauthorized | equipment/documents |
| Equipment | Spare BOM | equipment/spare view | spare-bom CRUD | Asset/inventory roles | Yes | map/update/remove | cross-site/duplicate | equipment/spare-bom |
| Request | Request lifecycle | `/maintenance/requests` | requests CRUD/search/transition | Request roles | Yes | create/view/update/status | invalid state/cross-site | maintenance-request/request |
| Approval config | Approval rules | `/admin/approval-config` | approval-config create/update | Admin | Model is global | active/inactive rule | duplicate/invalid approver | UI/contract only (partial) |
| Approval | Pending/history | `/approvals/*` | pending/history/detail | Approver | Yes | eligible records only | filter override/cross-site | approval/approval-workflow |
| Approval | Approve/reject | pending approvals | approve/reject | Approver | Yes | status and history sync | double/wrong-site/ordinary user | cross-user environment required (partial) |
| Assignment | Assignment lifecycle | `/maintenance/assignments` | assignments CRUD/search | Manager | Yes | valid request/employee/vendor | inactive/cross-site/duplicate | assignment/assignment |
| Assignment | My assignments | `/maintenance/my-assignments` | `/maintenance/assignments/my/search` | Technician | Identity + site | own server page | caller filter cannot impersonate | assignment/my-assignments |
| Checklist | Execution checklist | assignment view | checklist CRUD/proof | Manager/technician | Via assignment | response and proof | missing proof/other assignment | contract/security only (partial) |
| Work log | Labor execution | assignment view | work-logs CRUD/attachments | Manager/technician | Via assignment | duration/linkage/files | negative time/cross-site/closed | work-log/work-log |
| Downtime | Downtime lifecycle | `/maintenance/downtime` | downtime CRUD/transitions/RCA | Maintenance roles | Yes | full status sequence/duration | overlap/end-before-start/site | downtime/downtime |
| Spare part | Master and stock | `/inventory/spare-parts` | spare-parts CRUD/search | Inventory roles | Yes | CRUD/paging/sort/filter | duplicate/negative/site | spare-parts/spare-master |
| Inventory | Stock transactions | spare view | stock-in/adjust/transfer | Inventory roles | Yes | stock before/after | zero/negative/insufficient/site | spare-parts/inventory |
| Spare usage | Maintenance consumption | assignment view/queues | assignment spares/spare requests | Workflow roles | Yes | request-reserve-issue-consume-return | invalid state/quantity/site | UI/contract only (partial) |
| Reorder | Purchase/reorder flow | `/inventory/reorders` | reorder create/update/receive | Inventory roles | Yes | low-stock to receipt | invalid state/site/quantity | UI/contract only (partial) |
| PM | Schedules and calendar | `/maintenance/preventive*` | schedules/calendar/generate | Request roles | Yes | create/update/due generation | invalid frequency/date/site | preventive-maintenance/pm |
| PM | Scheduler idempotency | PM pages | generate due work orders | Request create | Yes | one work order per due date | concurrent duplicate run | preventive-maintenance/scheduler |
| Vendor | Vendor lifecycle | `/vendors` | vendors CRUD/search | Vendor roles | Yes | CRUD/paging/filter | duplicate/invalid/site | vendor/vendor |
| Vendor AMC | Contract lifecycle | `/vendor-amc` | AMC CRUD/renew/map | AMC roles | Yes | contract/map/renew | bad dates/site/equipment | vendor-amc/vendor-amc |
| Notification | Inbox state | `/notifications` | list/count/read/archive/stream | Authenticated | User-specific | unread/read/archive | another user's record | notification/notification |
| Notification | Runtime settings | `/admin/notification-settings` | settings GET/PUT | Admin | No | disable/enable and restore | invalid cron/unauthorized | notification/settings |
| Reports | Equipment history | `/reports/equipment-history` | equipment-history | Report role | Yes | filters/paging/expected row | invalid range/site | reports/reports |
| Reports | Downtime analysis | `/reports/downtime-analysis` | downtime-analysis | Report role | Yes | aggregates/paging | invalid range/site | reports/reports |
| Reports | Equipment costs | `/reports/equipment-cost` | four cost APIs | Report role | Yes | grouping/empty/paging | invalid site/range | reports/reports |
| Dashboard | KPI and widgets | `/dashboard` | overview/summary/widgets | Mixed | Yes | compare deterministic fixtures | unauthorized widget/site | dashboard/dashboard |
| Search | Shared search contract | list pages | module `/search` APIs | Module view | Yes | exact/partial/case/special chars | invalid key/filter bypass | pagination/search-sort-filter |
| Pagination | Server paging | list/report pages | search/report APIs | Module view | Yes | 10/25/50, pages, totals | invalid/empty page | pagination/search-sort-filter |
| Sorting | Allowed columns | list/report pages | search/report APIs | Module view | Yes | ASC/DESC order | unsupported sort | pagination/search-sort-filter |
| Time | UTC/business-zone behavior | date/time forms | `/system/time`, timestamp DTOs | Public/authenticated | No | UTC round trips/DST | timezone-less input | regression/date-time |
| Error contract | Standard error envelope | all | all JSON APIs | Mixed | Mixed | correlation/error code | no stack trace/500 scan | regression/error-contract |

## Not reasonably automated without environment integration

| Feature | Reason | Recommended manual test |
| --- | --- | --- |
| Real SMTP/SMS delivery | No test-safe external provider is configured | Use provider sandbox and verify delivery/telemetry in a staging environment |
| Browser rendering of every binary type | Application returns raw files; semantic validation depends on external viewers | Download and open representative files in an approved desktop viewer |
| Wall-clock execution of daily schedulers | Waiting for production cron time is nondeterministic | Invoke the guarded generation API/service in a dedicated test environment and retain unit tests with a fixed clock |
| Sustained load | Kept separate from regression E2E by design | Run the existing k6 profiles after smoke passes |
