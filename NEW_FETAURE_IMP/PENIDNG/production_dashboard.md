# Production Dashboard Plan - Separate Widget Permissions And APIs

## Main Decision

Dashboard widgets must have their own permissions and their own backend APIs.

Do not decide dashboard widgets from role names.

Do not depend only on existing module permissions like `EQUIPMENT_VIEW`, `ASSIGNMENT_VIEW`, or `SPARE_PART_VIEW` to show dashboard widgets.

Correct production model:

```text
Custom Role Name
  -> Admin assigns dashboard widget permissions
  -> Frontend shows only widgets with assigned permission
  -> Frontend calls only APIs for visible widgets
  -> Backend API permission mapping blocks direct API access also
```

Example:

```text
Role Name: Electrical Supervisor
Permissions:
  DASHBOARD_VIEW
  DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS
  DASHBOARD_WIDGET_MAINTENANCE_ASSIGNMENT_QUEUE
  DASHBOARD_WIDGET_EQUIPMENT_BREAKDOWN

Result:
  User sees only those dashboard widgets.
  User can call only those widget APIs.
```

## Why Separate Dashboard Widget Permissions

Existing module permissions control module pages and actions.

Example:

- `EQUIPMENT_VIEW` controls equipment page access.
- `ASSIGNMENT_UPDATE` controls assignment update action.
- `SPARE_USAGE_STORE_PROCESS` controls store spare processing.

Dashboard widgets are different. A user may need to see a summary without opening the full module page.

Example:

- A plant head may see downtime KPIs but not edit downtime records.
- A store supervisor may see low stock widgets but not update spare part master.
- A safety user may see critical breakdown alerts but not create assignments.

So dashboard needs separate read permissions:

```text
DASHBOARD_WIDGET_*
```

Action buttons inside widgets should still use existing module/action permissions.

## Permission Layers

### Layer 1: Dashboard Page Access

Required to open dashboard route:

```text
DASHBOARD_VIEW
```

### Layer 2: Dashboard Widget View Permission

Required to see a widget and call its API:

```text
DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS
DASHBOARD_WIDGET_INVENTORY_LOW_STOCK
DASHBOARD_WIDGET_EQUIPMENT_STATUS
```

### Layer 3: Widget Action Permission

Required to show action buttons inside the widget:

```text
REQUEST_CREATE
ASSIGNMENT_UPDATE
SPARE_USAGE_STORE_PROCESS
REORDER_CREATE
```

Example:

```text
Widget: Low Stock Spares
Widget API Permission: DASHBOARD_WIDGET_INVENTORY_LOW_STOCK
Action Button: Create Reorder
Action Permission: REORDER_CREATE
```

If user has widget permission but not action permission:

- Show low stock data.
- Hide `Create Reorder` button.

## Department Dashboard Structure

Dashboard should be grouped by department/work area:

```text
Overview
Maintenance
Technician Work
Inventory / Store
Equipment
AMC / Vendor
Approvals
Reports
HR
Administration
```

Show a department tab only if the user has at least one widget permission for that department.

## Permission Naming Standard

Use this format:

```text
DASHBOARD_WIDGET_{DEPARTMENT}_{WIDGET_NAME}
```

Examples:

```text
DASHBOARD_WIDGET_OVERVIEW_KPI_SUMMARY
DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS
DASHBOARD_WIDGET_TECHNICIAN_MY_JOBS
DASHBOARD_WIDGET_INVENTORY_LOW_STOCK
DASHBOARD_WIDGET_EQUIPMENT_STATUS
DASHBOARD_WIDGET_VENDOR_AMC_EXPIRING
DASHBOARD_WIDGET_APPROVAL_PENDING
DASHBOARD_WIDGET_REPORT_DOWNTIME_SUMMARY
DASHBOARD_WIDGET_HR_EMPLOYEE_SETUP
DASHBOARD_WIDGET_ADMIN_ACCESS_HEALTH
```

Use `module_name = Dashboard - {Department}` in `permission_master`.

Use `action_name = WIDGET_VIEW`.

## Backend API Standard

Each widget should have a separate API.

Use endpoint shape:

```text
GET /api/dashboard/widgets/{department}/{widget}
```

Examples:

```text
GET /api/dashboard/widgets/maintenance/open-requests
GET /api/dashboard/widgets/maintenance/assignment-queue
GET /api/dashboard/widgets/inventory/low-stock
GET /api/dashboard/widgets/equipment/status
GET /api/dashboard/widgets/vendor-amc/expiring
GET /api/dashboard/widgets/admin/access-health
```

Each API must be mapped in:

```text
cmms_back_end/src/main/resources/api-permission-mapping.csv
```

This makes direct API access secure. If a user does not have the widget permission, the backend blocks the API before controller/service execution.

## Dashboard Metadata API

Use one metadata API to tell frontend which widgets exist and which APIs to call.

```text
GET /api/dashboard/me
```

Permission:

```text
DASHBOARD_VIEW
```

Response example:

```json
{
  "defaultDepartment": "MAINTENANCE",
  "departments": [
    {
      "code": "MAINTENANCE",
      "label": "Maintenance",
      "widgets": [
        {
          "code": "DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS",
          "title": "Open Requests",
          "type": "KPI",
          "apiPath": "/api/dashboard/widgets/maintenance/open-requests",
          "refreshSeconds": 60,
          "targetPath": "/maintenance/requests?status=OPEN",
          "actionPermissions": ["REQUEST_CREATE", "REQUEST_UPDATE"]
        }
      ]
    }
  ]
}
```

Backend should include only widgets where the logged-in user has the widget permission.

Frontend should not hardcode role names.

## Department Widget Permissions And APIs

### 1. Overview Widgets

| Widget | Permission | API |
|---|---|---|
| KPI Summary | `DASHBOARD_WIDGET_OVERVIEW_KPI_SUMMARY` | `GET /api/dashboard/widgets/overview/kpi-summary` |
| Critical Alerts | `DASHBOARD_WIDGET_OVERVIEW_CRITICAL_ALERTS` | `GET /api/dashboard/widgets/overview/critical-alerts` |
| Today Work Summary | `DASHBOARD_WIDGET_OVERVIEW_TODAY_WORK` | `GET /api/dashboard/widgets/overview/today-work` |
| Site Health Summary | `DASHBOARD_WIDGET_OVERVIEW_SITE_HEALTH` | `GET /api/dashboard/widgets/overview/site-health` |

### 2. Maintenance Widgets

| Widget | Permission | API |
|---|---|---|
| Open Requests | `DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS` | `GET /api/dashboard/widgets/maintenance/open-requests` |
| Critical Requests | `DASHBOARD_WIDGET_MAINTENANCE_CRITICAL_REQUESTS` | `GET /api/dashboard/widgets/maintenance/critical-requests` |
| Unassigned Work | `DASHBOARD_WIDGET_MAINTENANCE_UNASSIGNED_WORK` | `GET /api/dashboard/widgets/maintenance/unassigned-work` |
| Assignment Queue | `DASHBOARD_WIDGET_MAINTENANCE_ASSIGNMENT_QUEUE` | `GET /api/dashboard/widgets/maintenance/assignment-queue` |
| Overdue Assignments | `DASHBOARD_WIDGET_MAINTENANCE_OVERDUE_ASSIGNMENTS` | `GET /api/dashboard/widgets/maintenance/overdue-assignments` |
| SLA Breaches | `DASHBOARD_WIDGET_MAINTENANCE_SLA_BREACHES` | `GET /api/dashboard/widgets/maintenance/sla-breaches` |
| PM Due This Week | `DASHBOARD_WIDGET_MAINTENANCE_PM_DUE` | `GET /api/dashboard/widgets/maintenance/pm-due` |
| Downtime Open | `DASHBOARD_WIDGET_MAINTENANCE_DOWNTIME_OPEN` | `GET /api/dashboard/widgets/maintenance/downtime-open` |

Action buttons inside maintenance widgets:

| Action | Existing Action Permission |
|---|---|
| Create Request | `REQUEST_CREATE` |
| Edit Request | `REQUEST_UPDATE` |
| Create Assignment | `ASSIGNMENT_CREATE` |
| Reassign Job | `ASSIGNMENT_UPDATE` |
| Verify Downtime | `DOWNTIME_VERIFY` |
| Close Downtime | `DOWNTIME_CLOSE` |

### 3. Technician Work Widgets

| Widget | Permission | API |
|---|---|---|
| My Jobs | `DASHBOARD_WIDGET_TECHNICIAN_MY_JOBS` | `GET /api/dashboard/widgets/technician/my-jobs` |
| Current Job | `DASHBOARD_WIDGET_TECHNICIAN_CURRENT_JOB` | `GET /api/dashboard/widgets/technician/current-job` |
| Due Today | `DASHBOARD_WIDGET_TECHNICIAN_DUE_TODAY` | `GET /api/dashboard/widgets/technician/due-today` |
| Overdue Jobs | `DASHBOARD_WIDGET_TECHNICIAN_OVERDUE_JOBS` | `GET /api/dashboard/widgets/technician/overdue-jobs` |
| Checklist Pending | `DASHBOARD_WIDGET_TECHNICIAN_CHECKLIST_PENDING` | `GET /api/dashboard/widgets/technician/checklist-pending` |
| Work Log Pending | `DASHBOARD_WIDGET_TECHNICIAN_WORK_LOG_PENDING` | `GET /api/dashboard/widgets/technician/work-log-pending` |
| My Spare Requests | `DASHBOARD_WIDGET_TECHNICIAN_SPARE_REQUESTS` | `GET /api/dashboard/widgets/technician/spare-requests` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Acknowledge Job | `ASSIGNMENT_UPDATE` |
| Start Job | `ASSIGNMENT_UPDATE` |
| Pause / Hold Job | `ASSIGNMENT_UPDATE` |
| Add Work Log | `ASSIGNMENT_WORK_LOG_CREATE` |
| Upload Proof | `ASSIGNMENT_CHECKLIST_PROOF_UPLOAD` |
| Request Spare | `SPARE_USAGE_CREATE` |
| Mark Complete | `ASSIGNMENT_UPDATE` |

Important:

- Technician widget APIs must filter data by logged-in user/employee assignment.
- Do not return other technicians' jobs unless a separate supervisor widget permission exists.

### 4. Inventory / Store Widgets

| Widget | Permission | API |
|---|---|---|
| Low Stock Spares | `DASHBOARD_WIDGET_INVENTORY_LOW_STOCK` | `GET /api/dashboard/widgets/inventory/low-stock` |
| Out Of Stock Spares | `DASHBOARD_WIDGET_INVENTORY_OUT_OF_STOCK` | `GET /api/dashboard/widgets/inventory/out-of-stock` |
| Pending Spare Issues | `DASHBOARD_WIDGET_INVENTORY_PENDING_ISSUES` | `GET /api/dashboard/widgets/inventory/pending-issues` |
| Reserved Stock | `DASHBOARD_WIDGET_INVENTORY_RESERVED_STOCK` | `GET /api/dashboard/widgets/inventory/reserved-stock` |
| Reorder Queue | `DASHBOARD_WIDGET_INVENTORY_REORDER_QUEUE` | `GET /api/dashboard/widgets/inventory/reorder-queue` |
| Stock Transactions Today | `DASHBOARD_WIDGET_INVENTORY_STOCK_TRANSACTIONS` | `GET /api/dashboard/widgets/inventory/stock-transactions` |
| Fast Moving Spares | `DASHBOARD_WIDGET_INVENTORY_FAST_MOVING` | `GET /api/dashboard/widgets/inventory/fast-moving` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Issue Spare | `SPARE_USAGE_ISSUE` or `SPARE_USAGE_STORE_PROCESS` |
| Reserve Spare | `SPARE_USAGE_RESERVE` |
| Return Spare | `SPARE_USAGE_RETURN` |
| Create Reorder | `REORDER_CREATE` |
| Receive Stock | `REORDER_UPDATE` |
| Adjust Stock | `STOCK_TRANSACTION_CREATE` |

### 5. Equipment Widgets

| Widget | Permission | API |
|---|---|---|
| Equipment Status | `DASHBOARD_WIDGET_EQUIPMENT_STATUS` | `GET /api/dashboard/widgets/equipment/status` |
| Breakdown Equipment | `DASHBOARD_WIDGET_EQUIPMENT_BREAKDOWN` | `GET /api/dashboard/widgets/equipment/breakdown` |
| Equipment Without AMC | `DASHBOARD_WIDGET_EQUIPMENT_WITHOUT_AMC` | `GET /api/dashboard/widgets/equipment/without-amc` |
| Top Downtime Equipment | `DASHBOARD_WIDGET_EQUIPMENT_TOP_DOWNTIME` | `GET /api/dashboard/widgets/equipment/top-downtime` |
| High Cost Equipment | `DASHBOARD_WIDGET_EQUIPMENT_HIGH_COST` | `GET /api/dashboard/widgets/equipment/high-cost` |
| Document Expiry | `DASHBOARD_WIDGET_EQUIPMENT_DOCUMENT_EXPIRY` | `GET /api/dashboard/widgets/equipment/document-expiry` |
| Spare BOM Gaps | `DASHBOARD_WIDGET_EQUIPMENT_SPARE_BOM_GAPS` | `GET /api/dashboard/widgets/equipment/spare-bom-gaps` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Add Equipment | `EQUIPMENT_CREATE` |
| Edit Equipment | `EQUIPMENT_UPDATE` |
| Create Maintenance Request | `REQUEST_CREATE` |
| Open Equipment History | `REPORT_VIEW` |

### 6. AMC / Vendor Widgets

| Widget | Permission | API |
|---|---|---|
| Active Vendors | `DASHBOARD_WIDGET_VENDOR_ACTIVE_VENDORS` | `GET /api/dashboard/widgets/vendor-amc/active-vendors` |
| Vendor Performance | `DASHBOARD_WIDGET_VENDOR_PERFORMANCE` | `GET /api/dashboard/widgets/vendor-amc/performance` |
| Active AMC Contracts | `DASHBOARD_WIDGET_VENDOR_AMC_ACTIVE` | `GET /api/dashboard/widgets/vendor-amc/active-contracts` |
| AMC Expiring | `DASHBOARD_WIDGET_VENDOR_AMC_EXPIRING` | `GET /api/dashboard/widgets/vendor-amc/expiring` |
| Expired AMC | `DASHBOARD_WIDGET_VENDOR_AMC_EXPIRED` | `GET /api/dashboard/widgets/vendor-amc/expired` |
| Vendor Jobs Pending | `DASHBOARD_WIDGET_VENDOR_PENDING_JOBS` | `GET /api/dashboard/widgets/vendor-amc/pending-jobs` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Create Vendor | `VENDOR_CREATE` |
| Update Vendor | `VENDOR_UPDATE` |
| Create AMC | `VENDOR_AMC_CREATE` |
| Renew AMC | `VENDOR_AMC_RENEW` |
| Assign Equipment | `VENDOR_AMC_ASSIGN_EQUIPMENT` |

### 7. Approval Widgets

| Widget | Permission | API |
|---|---|---|
| Pending Approvals | `DASHBOARD_WIDGET_APPROVAL_PENDING` | `GET /api/dashboard/widgets/approvals/pending` |
| Approval Ageing | `DASHBOARD_WIDGET_APPROVAL_AGEING` | `GET /api/dashboard/widgets/approvals/ageing` |
| Spare Approval Pending | `DASHBOARD_WIDGET_APPROVAL_SPARE_PENDING` | `GET /api/dashboard/widgets/approvals/spare-pending` |
| My Approval History | `DASHBOARD_WIDGET_APPROVAL_MY_HISTORY` | `GET /api/dashboard/widgets/approvals/my-history` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Approve | `APPROVAL_APPROVE` |
| Reject | `APPROVAL_REJECT` |
| Approve Spare Request | `SPARE_USAGE_MANAGER_APPROVE` |

### 8. Reports Widgets

| Widget | Permission | API |
|---|---|---|
| Downtime Summary | `DASHBOARD_WIDGET_REPORT_DOWNTIME_SUMMARY` | `GET /api/dashboard/widgets/reports/downtime-summary` |
| Equipment History Summary | `DASHBOARD_WIDGET_REPORT_EQUIPMENT_HISTORY` | `GET /api/dashboard/widgets/reports/equipment-history` |
| Equipment Cost Summary | `DASHBOARD_WIDGET_REPORT_EQUIPMENT_COST` | `GET /api/dashboard/widgets/reports/equipment-cost` |
| Spare Consumption Summary | `DASHBOARD_WIDGET_REPORT_SPARE_CONSUMPTION` | `GET /api/dashboard/widgets/reports/spare-consumption` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Open Reports | `REPORT_VIEW` |
| Export Report | `REPORT_VIEW` |

### 9. HR Widgets

| Widget | Permission | API |
|---|---|---|
| Site Summary | `DASHBOARD_WIDGET_HR_SITE_SUMMARY` | `GET /api/dashboard/widgets/hr/site-summary` |
| Employee Summary | `DASHBOARD_WIDGET_HR_EMPLOYEE_SUMMARY` | `GET /api/dashboard/widgets/hr/employee-summary` |
| Employees Without User | `DASHBOARD_WIDGET_HR_EMPLOYEES_WITHOUT_USER` | `GET /api/dashboard/widgets/hr/employees-without-user` |
| Employees Without Manager | `DASHBOARD_WIDGET_HR_EMPLOYEES_WITHOUT_MANAGER` | `GET /api/dashboard/widgets/hr/employees-without-manager` |
| Site Manpower | `DASHBOARD_WIDGET_HR_SITE_MANPOWER` | `GET /api/dashboard/widgets/hr/site-manpower` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Create Site | `SITE_CREATE` |
| Update Site | `SITE_UPDATE` |
| Create Employee | `EMPLOYEE_CREATE` |
| Update Employee | `EMPLOYEE_UPDATE` |
| Assign User Role | `USER_ROLE_ASSIGN` |

### 10. Administration Widgets

| Widget | Permission | API |
|---|---|---|
| Access Health | `DASHBOARD_WIDGET_ADMIN_ACCESS_HEALTH` | `GET /api/dashboard/widgets/admin/access-health` |
| Roles Summary | `DASHBOARD_WIDGET_ADMIN_ROLES_SUMMARY` | `GET /api/dashboard/widgets/admin/roles-summary` |
| Users Without Roles | `DASHBOARD_WIDGET_ADMIN_USERS_WITHOUT_ROLES` | `GET /api/dashboard/widgets/admin/users-without-roles` |
| Permission Mapping Health | `DASHBOARD_WIDGET_ADMIN_PERMISSION_MAPPING` | `GET /api/dashboard/widgets/admin/permission-mapping` |
| Approval Config Status | `DASHBOARD_WIDGET_ADMIN_APPROVAL_CONFIG` | `GET /api/dashboard/widgets/admin/approval-config` |
| Notification Config Status | `DASHBOARD_WIDGET_ADMIN_NOTIFICATION_CONFIG` | `GET /api/dashboard/widgets/admin/notification-config` |
| Company Master Status | `DASHBOARD_WIDGET_ADMIN_COMPANY_MASTER` | `GET /api/dashboard/widgets/admin/company-master` |

Action buttons:

| Action | Existing Action Permission |
|---|---|
| Create Role | `ROLE_CREATE` |
| Update Role | `ROLE_UPDATE` |
| Assign User Roles | `USER_ROLE_ASSIGN` or `USER_ROLE_UPDATE` |
| Update Approval Config | `APPROVAL_CONFIG_UPDATE` |
| Update Notification Settings | `NOTIFICATION_CONFIG_UPDATE` |
| Update Company Master | `COMPANY_UPDATE` |

## Permission Seed Plan

Add a new Liquibase changeset in `permission_master.xml` or a new dashboard-specific permission changelog included in `db.changelog-master.xml`.

Recommended file:

```text
cmms_back_end/src/main/resources/db/changelog/cmms/dashboard_widget_permissions.xml
```

Seed permissions like:

```xml
<changeSet id="dashboard-widget-permissions-001-seed" author="Codex">
    <sql>
        INSERT INTO permission_master (permission_code, permission_name, module_name, action_name, status, created_at, updated_at) VALUES
        ('DASHBOARD_WIDGET_OVERVIEW_KPI_SUMMARY', 'Dashboard Widget - Overview KPI Summary', 'Dashboard - Overview', 'WIDGET_VIEW', 'ACTIVE', NOW(), NOW()),
        ('DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS', 'Dashboard Widget - Maintenance Open Requests', 'Dashboard - Maintenance', 'WIDGET_VIEW', 'ACTIVE', NOW(), NOW()),
        ('DASHBOARD_WIDGET_INVENTORY_LOW_STOCK', 'Dashboard Widget - Inventory Low Stock', 'Dashboard - Inventory', 'WIDGET_VIEW', 'ACTIVE', NOW(), NOW())
        ON CONFLICT (permission_code) DO NOTHING;
    </sql>
</changeSet>
```

In final implementation, include all widget permissions listed in this plan.

## API Permission Mapping Plan

Add one row per widget API in:

```text
cmms_back_end/src/main/resources/api-permission-mapping.csv
```

Example:

```csv
DASHBOARD_VIEW,/api/dashboard/me,GET,View dashboard metadata
DASHBOARD_WIDGET_MAINTENANCE_OPEN_REQUESTS,/api/dashboard/widgets/maintenance/open-requests,GET,Dashboard widget maintenance open requests
DASHBOARD_WIDGET_MAINTENANCE_ASSIGNMENT_QUEUE,/api/dashboard/widgets/maintenance/assignment-queue,GET,Dashboard widget maintenance assignment queue
DASHBOARD_WIDGET_INVENTORY_LOW_STOCK,/api/dashboard/widgets/inventory/low-stock,GET,Dashboard widget inventory low stock
DASHBOARD_WIDGET_EQUIPMENT_STATUS,/api/dashboard/widgets/equipment/status,GET,Dashboard widget equipment status
```

Important:

- Do not use only `DASHBOARD_VIEW,/api/dashboard/**,GET` for all widget APIs.
- Each widget API must have its own permission mapping.
- This ensures users cannot call hidden widget APIs directly.

## Backend Structure

Use existing dashboard module structure:

```text
cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/
    controller/
    service/
    dto/
```

Recommended controllers:

```text
DashboardController.java
DashboardWidgetController.java
```

Recommended service classes:

```text
DashboardMetadataService.java
DashboardOverviewWidgetService.java
DashboardMaintenanceWidgetService.java
DashboardTechnicianWidgetService.java
DashboardInventoryWidgetService.java
DashboardEquipmentWidgetService.java
DashboardVendorAmcWidgetService.java
DashboardApprovalWidgetService.java
DashboardReportWidgetService.java
DashboardHrWidgetService.java
DashboardAdminWidgetService.java
```

Recommended DTOs:

```text
DashboardMeDTO
DashboardDepartmentDTO
DashboardWidgetDefinitionDTO
DashboardWidgetResponseDTO
DashboardKpiDTO
DashboardActionDTO
DashboardAlertDTO
DashboardTableDTO
DashboardTableColumnDTO
DashboardTableRowDTO
DashboardTrendDTO
DashboardFilterDTO
```

All successful JSON APIs must return:

```text
ApiResponse<T>
```

Use:

```text
ResponseFactory
```

## Backend Security Rule

Authorization must stay centralized in:

```text
JwtFilter
ApiPermissionService
api-permission-mapping.csv
```

Do not add controller/service permission checks for normal API permission validation.

Service checks are still needed for:

- Site access.
- Record-level access.
- Current user's own technician jobs.
- Business restrictions.

Example:

```java
accessControlService.validateSiteAccess(siteId);
```

## Frontend Structure

Use existing dashboard feature folder:

```text
cmms_front_end/src/features/dashboard/
    pages/
    components/
    services/
    constants/
    hooks/
```

Recommended files:

```text
pages/DashboardPage.jsx
components/DashboardShell.jsx
components/DashboardDepartmentTabs.jsx
components/DashboardWidgetGrid.jsx
components/DashboardKpiWidget.jsx
components/DashboardTableWidget.jsx
components/DashboardChartWidget.jsx
components/DashboardAlertWidget.jsx
components/DashboardWidgetError.jsx
services/dashboardService.js
constants/dashboardWidgetCatalog.js
hooks/useDashboardMetadata.js
hooks/useDashboardWidget.js
```

Frontend flow:

1. User opens `/dashboard`.
2. Frontend calls `GET /api/dashboard/me`.
3. Backend returns only widgets the user has widget permissions for.
4. Frontend renders department tabs from returned widgets.
5. For each visible widget, frontend calls that widget's API.
6. If API returns `403`, show no data or a small "Not allowed" placeholder and remove widget on next refresh.

## Frontend Service Example

```js
export const getDashboardMetadata = () => api.get('/dashboard/me').then((response) => response.data);

export const getDashboardWidget = (apiPath, params = {}) => (
  api.get(apiPath.replace(/^\/api/, ''), { params }).then((response) => response.data)
);
```

## Widget Response Format

Each widget API should return a consistent shape.

KPI widget:

```json
{
  "widgetCode": "DASHBOARD_WIDGET_INVENTORY_LOW_STOCK",
  "type": "KPI",
  "title": "Low Stock Spares",
  "value": 14,
  "severity": "WARNING",
  "targetPath": "/inventory/spare-parts?stock=LOW",
  "actions": [
    {
      "label": "Create Reorder",
      "targetPath": "/inventory/reorders",
      "permissionCode": "REORDER_CREATE"
    }
  ],
  "generatedAt": "2026-07-20T10:30:00"
}
```

Table widget:

```json
{
  "widgetCode": "DASHBOARD_WIDGET_MAINTENANCE_ASSIGNMENT_QUEUE",
  "type": "TABLE",
  "title": "Assignment Queue",
  "columns": [
    { "field": "assignmentId", "label": "ID" },
    { "field": "equipmentName", "label": "Equipment" },
    { "field": "priority", "label": "Priority" },
    { "field": "status", "label": "Status" }
  ],
  "rows": [],
  "targetPath": "/maintenance/assignments",
  "generatedAt": "2026-07-20T10:30:00"
}
```

## Role Form Improvement

Because these are new permissions, they should appear in role creation/update.

In role permission grouping, add a new top category:

```text
Dashboard Widgets
```

Sub groups:

```text
Overview
Maintenance
Technician Work
Inventory / Store
Equipment
AMC / Vendor
Approvals
Reports
HR
Administration
```

Admin can create any role name and assign exact dashboard widgets.

Example:

```text
Role Name: Plant Head
Dashboard Widget Permissions:
  DASHBOARD_WIDGET_OVERVIEW_KPI_SUMMARY
  DASHBOARD_WIDGET_OVERVIEW_CRITICAL_ALERTS
  DASHBOARD_WIDGET_EQUIPMENT_STATUS
  DASHBOARD_WIDGET_MAINTENANCE_SLA_BREACHES
  DASHBOARD_WIDGET_VENDOR_AMC_EXPIRING
```

Example:

```text
Role Name: Store Keeper
Dashboard Widget Permissions:
  DASHBOARD_WIDGET_INVENTORY_LOW_STOCK
  DASHBOARD_WIDGET_INVENTORY_PENDING_ISSUES
  DASHBOARD_WIDGET_INVENTORY_REORDER_QUEUE
```

## API Call Pattern

Do not load one big dashboard payload for everything.

Recommended:

```text
GET /api/dashboard/me
GET /api/dashboard/widgets/overview/kpi-summary
GET /api/dashboard/widgets/maintenance/open-requests
GET /api/dashboard/widgets/inventory/low-stock
```

Benefits:

- Backend security is clear per widget.
- Frontend loads only allowed widgets.
- Heavy widgets can refresh slower.
- One broken widget does not break the full dashboard.
- Easy to add/remove widgets later.

## Site Scoping

Every widget API must respect site access.

Rules:

- Site filter should list only allowed sites.
- Widget counts must use allowed sites.
- If `siteId` is passed, validate access to that site.
- If no `siteId` is passed, aggregate only over allowed sites for non-global users.
- Technician widgets must return only current user's work unless the widget is a supervisor/team widget with its own permission.

## Implementation Phases

### Phase 1: Permission And API Foundation

Build:

- `dashboard_widget_permissions.xml`
- Permission seed for widget permissions.
- `api-permission-mapping.csv` entries per widget API.
- `GET /api/dashboard/me`.
- Widget metadata DTOs.

Deliverable:

- Role admin can assign dashboard widget permissions.
- Dashboard metadata returns only allowed widgets.

### Phase 2: Existing Dashboard Split Into Widgets

Convert current dashboard into separate widget APIs:

- KPI summary.
- Equipment status.
- Monthly downtime.
- Vendor performance.
- Upcoming maintenance.
- AMC summary.

Each widget gets its own permission and API.

### Phase 3: Maintenance And Technician Widgets

Build:

- Open requests.
- Assignment queue.
- Overdue assignments.
- SLA breaches.
- My jobs.
- Current job.
- Checklist pending.
- Work log pending.

### Phase 4: Inventory / Store Widgets

Build:

- Low stock.
- Out of stock.
- Pending spare issues.
- Reorder queue.
- Stock transactions.

### Phase 5: Admin, HR, Reports Widgets

Build:

- Access health.
- Users without roles.
- Permission mapping health.
- Employee setup.
- Site manpower.
- Report summaries.

### Phase 6: Production Enhancements

Build:

- Auto refresh per widget.
- Widget loading skeleton.
- Widget error boundary.
- Saved widget order.
- User hidden widgets.
- Dashboard alert persistence.
- Metric caching for heavy widgets.

## Final MVP

Build this first:

```text
1. DASHBOARD_VIEW base page permission
2. DASHBOARD_WIDGET_* permissions
3. /api/dashboard/me metadata API
4. Separate /api/dashboard/widgets/... APIs
5. api-permission-mapping.csv row per widget API
6. Frontend renders only metadata widgets
7. Role form groups dashboard widget permissions clearly
```

This is the clean production design because both UI visibility and direct API access are controlled by explicit dashboard widget permissions.

