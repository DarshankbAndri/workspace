# Production Dashboard Plan - Department And Permission Based

## Main Decision

Do not build dashboard visibility using fixed role names like `SITE_MANAGER`, `TECHNICIAN`, or `STORE`.

In production, the customer/admin can create any role name they want:

- Shift Incharge
- Electrical Supervisor
- Mechanical Technician
- Store Keeper
- Plant Head
- Vendor Coordinator
- Safety Officer
- Any custom role

Because of that, dashboard access must be based on permissions, not role names.

The dashboard should be organized by department/work area, and every widget should have required permissions. If the logged-in user has the required permission, they see the widget. If not, the widget is hidden.

## Recommended Model

Use one route:

```text
/dashboard
```

Dashboard page should load:

```text
GET /api/dashboard/me
```

Backend returns:

- User permissions.
- Allowed sites.
- Available dashboard departments.
- Available widgets.
- Default department tab.
- Quick actions allowed for the user.

The frontend does not ask, "What role is this user?"

The frontend asks:

```js
hasPermission('EQUIPMENT_VIEW')
hasPermission('ASSIGNMENT_VIEW')
hasPermission('SPARE_USAGE_STORE_PROCESS')
hasPermission('ROLE_VIEW')
```

Then it shows the correct dashboard widgets.

## Department Dashboard Tabs

Dashboard should have permission-based department tabs:

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

Only show a tab if the user has at least one widget permission inside that tab.

Example:

- A custom role called `Electrical Day Shift` may have `DASHBOARD_VIEW`, `ASSIGNMENT_VIEW`, `ASSIGNMENT_UPDATE`, `SPARE_USAGE_CREATE`.
- That user should see `Overview`, `Maintenance`, and `Technician Work`.
- They should not see `Administration`, `HR`, or `AMC / Vendor`.

## Dashboard Permission Rules

Base permission:

```text
DASHBOARD_VIEW
```

Without `DASHBOARD_VIEW`, user cannot open `/dashboard`.

Every widget also needs one or more module permissions.

Widget rule:

```text
show widget only when user has all requiredPermissions
```

Alternative for mixed widgets:

```text
show widget when user has any one permission from anyOfPermissions
hide action buttons when action permission is missing
```

Example:

```json
{
  "widgetCode": "MAINTENANCE_OPEN_ASSIGNMENTS",
  "department": "MAINTENANCE",
  "requiredPermissions": ["ASSIGNMENT_VIEW"],
  "actions": [
    {
      "label": "Assign",
      "permission": "ASSIGNMENT_UPDATE"
    }
  ]
}
```

## Department 1: Overview Dashboard

Purpose:

- Give a common summary to any dashboard user.
- Show only high-level numbers allowed by permissions.

Widgets:

| Widget | Permission |
|---|---|
| Total Equipment | `EQUIPMENT_VIEW` |
| Open Maintenance Requests | `REQUEST_VIEW` |
| My Assigned Work | `ASSIGNMENT_VIEW` |
| Low Stock Spares | `SPARE_PART_VIEW` |
| Pending Approvals | `APPROVAL_VIEW` |
| AMC Expiring | `VENDOR_AMC_VIEW` |
| Downtime This Month | `DOWNTIME_VIEW` |
| PM Due Soon | `PM_CALENDAR_VIEW` or `REQUEST_VIEW` |

Layout:

```text
Header: Dashboard + site filter + date range + refresh
Row 1: Permission-based KPI cards
Row 2: Alerts user can act on
Row 3: Trends allowed by permission
```

## Department 2: Maintenance Dashboard

Purpose:

- Manage maintenance request and assignment execution.

Visible when user has any:

```text
REQUEST_VIEW
ASSIGNMENT_VIEW
DOWNTIME_VIEW
PM_CALENDAR_VIEW
```

Widgets:

| Widget | View Permission | Action Permission |
|---|---|---|
| Open Requests | `REQUEST_VIEW` | `REQUEST_UPDATE` |
| Critical Requests | `REQUEST_VIEW` | `REQUEST_UPDATE` |
| Unassigned Requests | `REQUEST_VIEW` + `ASSIGNMENT_VIEW` | `ASSIGNMENT_CREATE` |
| Assignment Queue | `ASSIGNMENT_VIEW` | `ASSIGNMENT_UPDATE` |
| Overdue Assignments | `ASSIGNMENT_VIEW` | `ASSIGNMENT_UPDATE` |
| Jobs On Hold | `ASSIGNMENT_VIEW` | `ASSIGNMENT_UPDATE` |
| PM Due This Week | `PM_CALENDAR_VIEW` | `REQUEST_CREATE` |
| Downtime Open | `DOWNTIME_VIEW` | `DOWNTIME_UPDATE` |
| SLA Breaches | `REQUEST_VIEW` or `ASSIGNMENT_VIEW` | `ASSIGNMENT_UPDATE` |

Quick actions:

| Action | Permission |
|---|---|
| Create Request | `REQUEST_CREATE` |
| Edit Request | `REQUEST_UPDATE` |
| Create Assignment | `ASSIGNMENT_CREATE` |
| Reassign Job | `ASSIGNMENT_UPDATE` |
| Close Downtime | `DOWNTIME_CLOSE` |
| Verify Downtime | `DOWNTIME_VERIFY` |

Recommended first screen:

```text
Maintenance Dashboard
  KPI: Open Requests
  KPI: Unassigned
  KPI: Overdue
  KPI: SLA Breach
  Table: Work Queue
  Board: Assignment Status
  Panel: PM Due Soon
```

## Department 3: Technician Work Dashboard

Purpose:

- Give hands-on users a fast work execution screen.
- This is not role-based. Any user with assignment execution permissions can see it.

Visible when user has any:

```text
ASSIGNMENT_VIEW
ASSIGNMENT_WORK_LOG_CREATE
ASSIGNMENT_CHECKLIST_UPDATE
SPARE_USAGE_CREATE
```

Widgets:

| Widget | Permission |
|---|---|
| My Assigned Jobs | `ASSIGNMENT_VIEW` |
| My Due Today | `ASSIGNMENT_VIEW` |
| My Overdue Jobs | `ASSIGNMENT_VIEW` |
| Current Job | `ASSIGNMENT_VIEW` |
| Checklist Pending | `ASSIGNMENT_CHECKLIST_VIEW` |
| Proof Upload Pending | `ASSIGNMENT_CHECKLIST_PROOF_UPLOAD` |
| Work Log Required | `ASSIGNMENT_WORK_LOG_VIEW` |
| Spare Requests For My Jobs | `SPARE_USAGE_VIEW` |

Actions:

| Action | Permission |
|---|---|
| Acknowledge Job | `ASSIGNMENT_UPDATE` |
| Start Job | `ASSIGNMENT_UPDATE` |
| Put On Hold | `ASSIGNMENT_UPDATE` |
| Add Work Log | `ASSIGNMENT_WORK_LOG_CREATE` |
| Upload Proof | `ASSIGNMENT_CHECKLIST_PROOF_UPLOAD` |
| Request Spare | `SPARE_USAGE_CREATE` |
| Mark Complete | `ASSIGNMENT_UPDATE` |

Mobile rule:

- This dashboard should be action-first.
- First visible card should be "Current Job" or "Next Job".
- Charts should be minimal for this department.

## Department 4: Inventory / Store Dashboard

Purpose:

- Manage spare availability, spare issue, reorder, stock movement.

Visible when user has any:

```text
SPARE_PART_VIEW
STOCK_TRANSACTION_VIEW
SPARE_USAGE_VIEW
SPARE_USAGE_STORE_PROCESS
REORDER_VIEW
```

Widgets:

| Widget | View Permission | Action Permission |
|---|---|---|
| Low Stock Parts | `SPARE_PART_VIEW` | `REORDER_CREATE` |
| Out Of Stock Parts | `SPARE_PART_VIEW` | `REORDER_CREATE` |
| Pending Spare Requests | `SPARE_USAGE_VIEW` | `SPARE_USAGE_STORE_PROCESS` |
| Reserved Stock | `SPARE_PART_VIEW` | `SPARE_USAGE_ISSUE` |
| Reorder Queue | `REORDER_VIEW` | `REORDER_UPDATE` |
| Stock Transactions Today | `STOCK_TRANSACTION_VIEW` | `STOCK_TRANSACTION_CREATE` |
| Fast Moving Spares | `SPARE_PART_VIEW` | none |
| Parts Without Vendor | `SPARE_PART_VIEW` | `SPARE_PART_UPDATE` |

Actions:

| Action | Permission |
|---|---|
| Create Spare Part | `SPARE_PART_CREATE` |
| Update Spare Part | `SPARE_PART_UPDATE` |
| Issue Spare | `SPARE_USAGE_ISSUE` or `SPARE_USAGE_STORE_PROCESS` |
| Reserve Spare | `SPARE_USAGE_RESERVE` |
| Return Spare | `SPARE_USAGE_RETURN` |
| Create Reorder | `REORDER_CREATE` |
| Receive Stock | `REORDER_UPDATE` or `STOCK_TRANSACTION_CREATE` |
| Adjust Stock | `STOCK_TRANSACTION_CREATE` |

## Department 5: Equipment Dashboard

Purpose:

- Track asset condition, history, AMC coverage, maintenance cost, and downtime impact.

Visible when user has:

```text
EQUIPMENT_VIEW
```

Widgets:

| Widget | Permission |
|---|---|
| Equipment Status | `EQUIPMENT_VIEW` |
| Breakdown Equipment | `EQUIPMENT_VIEW` |
| Equipment Without AMC | `EQUIPMENT_VIEW` + `VENDOR_AMC_VIEW` |
| Top Downtime Equipment | `EQUIPMENT_VIEW` + `DOWNTIME_VIEW` |
| High Cost Equipment | `EQUIPMENT_VIEW` + `REPORT_VIEW` |
| Equipment Documents Expiring | `EQUIPMENT_VIEW` |
| Equipment Spare BOM Gaps | `EQUIPMENT_VIEW` + `SPARE_PART_VIEW` |

Actions:

| Action | Permission |
|---|---|
| Add Equipment | `EQUIPMENT_CREATE` |
| Edit Equipment | `EQUIPMENT_UPDATE` |
| Upload Document | `EQUIPMENT_UPDATE` |
| View History | `REPORT_VIEW` |
| Create Request | `REQUEST_CREATE` |

## Department 6: AMC / Vendor Dashboard

Purpose:

- Track vendor support, AMC expiry, vendor performance, and uncovered equipment.

Visible when user has any:

```text
VENDOR_VIEW
VENDOR_AMC_VIEW
```

Widgets:

| Widget | Permission |
|---|---|
| Active Vendors | `VENDOR_VIEW` |
| Vendor Performance | `VENDOR_VIEW` + `ASSIGNMENT_VIEW` |
| Active AMC Contracts | `VENDOR_AMC_VIEW` |
| AMC Expiring In 30 Days | `VENDOR_AMC_VIEW` |
| Expired AMC Contracts | `VENDOR_AMC_VIEW` |
| Equipment Without AMC | `VENDOR_AMC_VIEW` + `EQUIPMENT_VIEW` |
| Vendor Jobs Pending | `VENDOR_VIEW` + `ASSIGNMENT_VIEW` |

Actions:

| Action | Permission |
|---|---|
| Add Vendor | `VENDOR_CREATE` |
| Update Vendor | `VENDOR_UPDATE` |
| Create AMC | `VENDOR_AMC_CREATE` |
| Update AMC | `VENDOR_AMC_UPDATE` |
| Renew AMC | `VENDOR_AMC_RENEW` |
| Assign Equipment To AMC | `VENDOR_AMC_ASSIGN_EQUIPMENT` |

## Department 7: Approvals Dashboard

Purpose:

- Show approvals and pending decisions.

Visible when user has any:

```text
APPROVAL_VIEW
SPARE_USAGE_MANAGER_APPROVE
```

Widgets:

| Widget | View Permission | Action Permission |
|---|---|---|
| Pending Approvals | `APPROVAL_VIEW` | `APPROVAL_APPROVE` / `APPROVAL_REJECT` |
| Approval Ageing | `APPROVAL_VIEW` | none |
| Spare Requests Waiting Manager | `SPARE_USAGE_VIEW` | `SPARE_USAGE_MANAGER_APPROVE` |
| My Approval History | `APPROVAL_VIEW` | none |

Actions:

| Action | Permission |
|---|---|
| Approve | `APPROVAL_APPROVE` |
| Reject | `APPROVAL_REJECT` |
| Approve Spare Request | `SPARE_USAGE_MANAGER_APPROVE` |

## Department 8: Reports Dashboard

Purpose:

- Give read-only analytics for managers/auditors.

Visible when user has:

```text
REPORT_VIEW
```

Widgets:

| Widget | Permission |
|---|---|
| Downtime Analysis Summary | `REPORT_VIEW` + `DOWNTIME_VIEW` |
| Equipment History Summary | `REPORT_VIEW` + `EQUIPMENT_VIEW` |
| Equipment Cost Summary | `REPORT_VIEW` + `EQUIPMENT_VIEW` |
| Maintenance Cost Trend | `REPORT_VIEW` |
| Spare Consumption Summary | `REPORT_VIEW` + `SPARE_PART_VIEW` |

Actions:

| Action | Permission |
|---|---|
| Open Equipment History Report | `REPORT_VIEW` |
| Open Downtime Analysis Report | `REPORT_VIEW` |
| Open Equipment Cost Report | `REPORT_VIEW` |
| Export Report | `REPORT_VIEW` |

## Department 9: HR Dashboard

Purpose:

- Track employee/site master readiness.

Visible when user has any:

```text
SITE_VIEW
EMPLOYEE_VIEW
```

Widgets:

| Widget | View Permission | Action Permission |
|---|---|---|
| Total Sites | `SITE_VIEW` | `SITE_CREATE` |
| Active Employees | `EMPLOYEE_VIEW` | `EMPLOYEE_UPDATE` |
| Employees Without User Account | `EMPLOYEE_VIEW` | `USER_ROLE_ASSIGN` |
| Employees Without Manager | `EMPLOYEE_VIEW` | `EMPLOYEE_UPDATE` |
| Site Manpower Summary | `SITE_VIEW` + `EMPLOYEE_VIEW` | none |

Actions:

| Action | Permission |
|---|---|
| Create Site | `SITE_CREATE` |
| Update Site | `SITE_UPDATE` |
| Create Employee | `EMPLOYEE_CREATE` |
| Update Employee | `EMPLOYEE_UPDATE` |
| Create User / Assign User Role | `USER_ROLE_ASSIGN` |

## Department 10: Administration Dashboard

Purpose:

- Track user access, role setup, permissions, company config, notification config, and approval config.

Visible when user has any:

```text
ROLE_VIEW
PERMISSION_VIEW
USER_ROLE_VIEW
APPROVAL_CONFIG_VIEW
NOTIFICATION_CONFIG_VIEW
COMPANY_VIEW
```

Widgets:

| Widget | View Permission | Action Permission |
|---|---|---|
| Roles Count | `ROLE_VIEW` | `ROLE_CREATE` / `ROLE_UPDATE` |
| Users Without Roles | `USER_ROLE_VIEW` | `USER_ROLE_ASSIGN` |
| Permission List Health | `PERMISSION_VIEW` | none |
| Approval Config Status | `APPROVAL_CONFIG_VIEW` | `APPROVAL_CONFIG_UPDATE` |
| Notification Config Status | `NOTIFICATION_CONFIG_VIEW` | `NOTIFICATION_CONFIG_UPDATE` |
| Company Master Status | `COMPANY_VIEW` | `COMPANY_UPDATE` |
| API Permission Mapping Health | `PERMISSION_VIEW` | none |

Actions:

| Action | Permission |
|---|---|
| Create Role | `ROLE_CREATE` |
| Update Role | `ROLE_UPDATE` |
| Assign User Roles | `USER_ROLE_ASSIGN` or `USER_ROLE_UPDATE` |
| Update Approval Config | `APPROVAL_CONFIG_UPDATE` |
| Update Notification Settings | `NOTIFICATION_CONFIG_UPDATE` |
| Update Company Master | `COMPANY_UPDATE` |

## Widget Configuration Model

Create a frontend/backend widget catalog.

Example:

```json
{
  "widgetCode": "INV_LOW_STOCK_SPARES",
  "department": "INVENTORY",
  "title": "Low Stock Spares",
  "requiredPermissions": ["SPARE_PART_VIEW"],
  "actionPermissions": ["REORDER_CREATE"],
  "targetPath": "/inventory/spare-parts?stock=LOW",
  "size": "small",
  "refreshSeconds": 60
}
```

Widget visibility:

```js
const canShowWidget = (widget, hasPermission) => (
  widget.requiredPermissions.every(hasPermission)
);
```

Action visibility:

```js
const visibleActions = widget.actions.filter((action) => hasPermission(action.permission));
```

Department tab visibility:

```js
const canShowDepartment = (department) => (
  department.widgets.some((widget) => canShowWidget(widget, hasPermission))
);
```

## Backend API Plan

Keep dashboard under existing module:

```text
cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/
```

Recommended APIs:

```text
GET /api/dashboard/me
GET /api/dashboard/overview
GET /api/dashboard/maintenance
GET /api/dashboard/technician-work
GET /api/dashboard/inventory
GET /api/dashboard/equipment
GET /api/dashboard/vendor-amc
GET /api/dashboard/approvals
GET /api/dashboard/reports
GET /api/dashboard/hr
GET /api/dashboard/admin
```

All APIs should return `ApiResponse<T>` through `ResponseFactory`.

All protected APIs should be in:

```text
cmms_back_end/src/main/resources/api-permission-mapping.csv
```

Suggested mapping:

```text
DASHBOARD_VIEW,/api/dashboard/**,GET,View dashboard
```

This can remain broad, because each widget still checks module permissions before returning sensitive counts/actions.

Service-level rule:

- Do not return a widget if the user lacks required permission.
- Do not return action buttons if the user lacks action permission.
- Apply site access with `AccessControlService`.
- For technician work, filter by current user/employee/assignment mapping.

## Dashboard DTO Plan

Recommended DTOs:

```text
DashboardMeDTO
DashboardDepartmentDTO
DashboardWidgetDTO
DashboardKpiDTO
DashboardActionDTO
DashboardAlertDTO
DashboardTableDTO
DashboardTableColumnDTO
DashboardTableRowDTO
DashboardTrendDTO
DashboardFilterDTO
```

Example response:

```json
{
  "defaultDepartment": "MAINTENANCE",
  "departments": [
    {
      "code": "MAINTENANCE",
      "label": "Maintenance",
      "widgets": [
        {
          "code": "MAINT_OPEN_ASSIGNMENTS",
          "title": "Open Assignments",
          "type": "KPI",
          "value": 18,
          "severity": "WARNING",
          "targetPath": "/maintenance/assignments?status=OPEN",
          "actions": [
            {
              "label": "Create Assignment",
              "targetPath": "/maintenance/assignments/new"
            }
          ]
        }
      ]
    }
  ],
  "generatedAt": "2026-07-20T10:30:00",
  "refreshAfterSeconds": 60
}
```

## Frontend Plan

Files:

```text
cmms_front_end/src/features/dashboard/pages/DashboardPage.jsx
cmms_front_end/src/features/dashboard/services/dashboardService.js
cmms_front_end/src/features/dashboard/components/DashboardShell.jsx
cmms_front_end/src/features/dashboard/components/DashboardDepartmentTabs.jsx
cmms_front_end/src/features/dashboard/components/DashboardWidgetGrid.jsx
cmms_front_end/src/features/dashboard/components/DashboardKpiWidget.jsx
cmms_front_end/src/features/dashboard/components/DashboardTableWidget.jsx
cmms_front_end/src/features/dashboard/components/DashboardChartWidget.jsx
cmms_front_end/src/features/dashboard/components/DashboardAlertWidget.jsx
cmms_front_end/src/features/dashboard/constants/dashboardWidgets.js
```

Frontend render logic:

```js
const departments = dashboard.departments.filter((department) => department.widgets.length > 0);
```

Rules:

- Keep one dashboard page.
- Tabs are departments, not roles.
- Widget visibility is permission-based.
- Actions inside widgets are permission-based.
- Use shared common components for filters.
- Use tables for work queues and action queues.
- Use charts for trends only.
- Do not show empty department tabs.

## Role And Permission Page Impact

Because users can create role names freely, the Role page should help admins understand dashboard access through permissions.

Recommended improvement in Role Form:

Current permission categories:

```text
Operation
HR
Admin
```

Add dashboard helper labels in the existing groups:

```text
Dashboard Access
Maintenance Dashboard Widgets
Technician Work Widgets
Inventory Dashboard Widgets
Equipment Dashboard Widgets
Vendor / AMC Dashboard Widgets
Approval Dashboard Widgets
HR Dashboard Widgets
Admin Dashboard Widgets
Report Dashboard Widgets
```

Do not create these as hardcoded roles. They are only permission guidance.

Example admin flow:

1. Admin creates role `Electrical Supervisor`.
2. Admin selects:
   - `DASHBOARD_VIEW`
   - `EQUIPMENT_VIEW`
   - `REQUEST_VIEW`
   - `ASSIGNMENT_VIEW`
   - `ASSIGNMENT_UPDATE`
   - `DOWNTIME_VIEW`
3. User with this role sees:
   - Overview tab
   - Maintenance tab
   - Equipment tab
   - Downtime widgets
   - Assignment actions allowed by `ASSIGNMENT_UPDATE`

Example store flow:

1. Admin creates role `Main Store Night Shift`.
2. Admin selects:
   - `DASHBOARD_VIEW`
   - `SPARE_PART_VIEW`
   - `STOCK_TRANSACTION_VIEW`
   - `SPARE_USAGE_VIEW`
   - `SPARE_USAGE_STORE_PROCESS`
   - `REORDER_VIEW`
3. User sees:
   - Overview tab
   - Inventory / Store tab
   - Pending spare issue queue
   - Low stock widgets
   - Reorder widgets

## Permission-Based Default Department

When a user opens `/dashboard`, choose default tab by permission priority.

No role names needed.

Recommended logic:

```js
if (hasPermission('ROLE_VIEW') || hasPermission('USER_ROLE_VIEW')) return 'ADMIN';
if (hasPermission('SPARE_USAGE_STORE_PROCESS')) return 'INVENTORY';
if (hasPermission('ASSIGNMENT_WORK_LOG_CREATE') || hasPermission('ASSIGNMENT_CHECKLIST_UPDATE')) return 'TECHNICIAN_WORK';
if (hasPermission('ASSIGNMENT_VIEW') || hasPermission('REQUEST_VIEW')) return 'MAINTENANCE';
if (hasPermission('EQUIPMENT_VIEW')) return 'EQUIPMENT';
if (hasPermission('VENDOR_AMC_VIEW') || hasPermission('VENDOR_VIEW')) return 'VENDOR_AMC';
if (hasPermission('EMPLOYEE_VIEW') || hasPermission('SITE_VIEW')) return 'HR';
if (hasPermission('REPORT_VIEW')) return 'REPORTS';
return 'OVERVIEW';
```

If multiple departments are available, show tabs so the user can switch.

## Site Scoping

Every dashboard metric must respect allowed sites.

Rules:

- Admin/global users can see all sites only if existing access service allows it.
- Non-admin users see only assigned/allowed sites.
- Site filter should only list allowed sites.
- Counts must be calculated from the same allowed site list.
- Dashboard must not leak totals from sites the user cannot access.

## Alerts

Alerts should also be permission-based.

Alert examples:

| Alert | Permission |
|---|---|
| Critical request unassigned | `REQUEST_VIEW` + `ASSIGNMENT_VIEW` |
| Assignment SLA breach | `ASSIGNMENT_VIEW` |
| Low stock spare | `SPARE_PART_VIEW` |
| Spare request waiting issue | `SPARE_USAGE_STORE_PROCESS` |
| AMC expiring | `VENDOR_AMC_VIEW` |
| Downtime not verified | `DOWNTIME_VERIFY` |
| Employee missing manager | `EMPLOYEE_VIEW` |
| User without role | `USER_ROLE_VIEW` |

## Implementation Phases

### Phase 1: Permission-Based Shell

Build:

- `GET /api/dashboard/me`
- Dashboard department tabs.
- Widget catalog.
- Permission-based frontend widget visibility.
- Move current dashboard cards/charts into permission-based widgets.

Deliverable:

- Dashboard no longer depends on role names.

### Phase 2: Maintenance And Technician Widgets

Build:

- Maintenance queue widgets.
- Assignment ageing.
- My jobs widgets.
- Checklist/proof/work-log pending widgets.
- SLA countdown chip.

Deliverable:

- Maintenance and technician users get operational dashboard based on permissions.

### Phase 3: Inventory / Store Widgets

Build:

- Low stock queue.
- Pending spare request queue.
- Reorder queue.
- Stock transaction summary.

Deliverable:

- Store users get inventory dashboard based on permissions.

### Phase 4: Equipment, AMC, Approvals, Reports

Build:

- Equipment health widgets.
- AMC risk widgets.
- Approval ageing.
- Report summary widgets.

Deliverable:

- Management dashboards become useful without requiring fixed manager roles.

### Phase 5: Admin And HR Widgets

Build:

- User role health.
- Permission mapping health.
- Employee setup gaps.
- Site manpower summary.

Deliverable:

- Admin/HR dashboards are driven by admin and HR permissions.

### Phase 6: Production Enhancements

Build:

- Auto refresh.
- Saved user dashboard preference.
- Widget ordering.
- Drill-down links.
- Export.
- Alert severity.
- Dashboard metric caching for heavy widgets.

## Database Tables Only If Needed

Start without new tables if possible.

Optional later tables:

```text
dashboard_user_preference
dashboard_widget_config
dashboard_alert
dashboard_metric_snapshot
```

Recommended first table only when personalization is needed:

```text
dashboard_user_preference
```

Fields:

- `id`
- `user_id`
- `default_department`
- `site_id`
- `date_range`
- `widget_order_json`
- `hidden_widget_codes_json`
- `created_at`
- `updated_at`

Use Liquibase XML if adding this table.

## Final MVP Recommendation

Build first:

1. Permission-based `GET /api/dashboard/me`.
2. Department tabs based on visible widgets.
3. Overview widgets from existing dashboard data.
4. Maintenance widgets using `REQUEST_*`, `ASSIGNMENT_*`, `DOWNTIME_*`.
5. Technician Work widgets using assignment checklist/work-log/spare permissions.
6. Inventory widgets using spare/reorder/store permissions.

Best production behavior:

```text
Custom Role Name
  -> Permissions assigned by admin
  -> Dashboard departments unlocked by permissions
  -> Widgets shown by permissions
  -> Actions shown by action permissions
```

This matches the real role/permission model: the customer can create any role name, and the dashboard still works correctly because permissions are the source of truth.

