# CMMS End-User Manual

**Application:** Solar Power Plant Computerized Maintenance Management System  
**Version:** 1.0  
**Verified:** 21 July 2026  
**Frontend reviewed:** `http://localhost:6200`  
**Audience:** Plant, maintenance, operations, store, HR, administration, vendor-coordination, and demonstration users

---

## Document control and scope

This manual explains the features that exist in the current CMMS, why they matter, who normally uses them, and how to complete daily work. Access is permission- and site-based, so two users may see different menus or buttons. A feature is called **Partially Available** when some source/API support exists but the complete user journey does not.

No credentials, tokens, or private customer information are included. Detailed create/edit field definitions are available in [CMMS Creation Page Documentation](CMMS-Creation-Page-Documentation.md).

## Contents

1. Getting started and security
2. Dashboard
3. Company, sites, employees, roles, and users
4. Vendors, AMC, and equipment
5. Maintenance requests, assignments, work logs, and downtime
6. Preventive maintenance
7. Spare parts, inventory, fulfilment, and reorders
8. Approvals and notifications
9. Reports
10. Common page behavior
11. Role quick guides
12. End-to-end workflows
13. Permissions and feature availability
14. Troubleshooting and glossary

---

<!-- USERFILE:01-getting-started.md -->
## 1. Getting Started

The CMMS keeps solar-plant equipment, maintenance work, downtime, vendor coverage, and spares in one controlled system. It helps teams answer: What failed? Who owns the work? Which parts were used? How long was production affected? What PM is due? Is the asset covered by AMC?

### Sign in and navigate

1. Open `http://localhost:6200/login`.
2. Enter the username and password issued by an administrator and select **Login**.
3. The application opens the first page allowed by your permissions, normally **Dashboard**.
4. Expand a sidebar group and select a page. On a phone, use the menu button.
5. Use the site selector where available; it limits data to a permitted solar plant.
6. Use the bell to open notifications. Use the profile menu to change theme or log out.

The standard journey is `Login → module list → record view → permitted action`. A hidden menu or button normally means the role lacks its permission. Records can also be limited by the user's site assignments.

### Main navigation

| Group | Current pages | Typical users |
|---|---|---|
| Dashboard | Role-configured metrics and widgets | All operational users with access |
| Masters | Equipment, Vendors, Vendor AMC | Engineering, managers, vendor coordinator |
| Maintenance | Requests, Assignments, Downtime, Preventive Maintenance, PM Calendar | Maintenance and plant teams |
| Inventory | Spare Parts, Spare Approval, Approved Spare Requests, Reorder Requests | Technician, manager, store |
| Approvals | Pending Approvals, Approval History | Configured approvers |
| Reports | Equipment History, Downtime Analysis, Equipment Cost | Managers and analysts |
| Creation | Sites, Employees | HR and administrators |
| Administration | Roles, Permissions, User Roles, Approval Configuration, Notification Settings, Company | Admin/Super Admin |

### Security and logout

Security follows `User → assigned role → permissions → permitted API`. Page access, action-button access, backend API access, and site access are separate checks. Seeing a page does not guarantee that every action or helper dropdown is permitted. A 403 response means the server denied the requested operation; contact an administrator with the correlation ID shown by the application.

Select the profile menu and **Logout** when finished, especially on a shared workstation. Sessions return to login when authentication expires. **Change Password is Partially Available:** the navbar link exists, but the current router has no functional change-password page. First-login forced password change is not implemented in the inspected UI.

---

<!-- USERFILE:02-dashboard.md -->
## 2. Dashboard

**Where:** Dashboard · **Permission:** `DASHBOARD_VIEW`  
The dashboard is role-configurable and site-aware. An administrator can determine which widgets a role receives; a user may therefore see fewer widgets than those listed here.

| Widget | Meaning and management use |
|---|---|
| Total Equipments | Count of equipment in scope; opens no guaranteed filtered list in the current UI. |
| Active Vendors | Active vendor count available to the selected scope. |
| Open Maintenance Requests | Work not in a terminal state; use it to assess backlog. |
| Low Stock Spare Parts | Site-stock lines below their configured minimum. |
| Total Downtime Hours | Aggregated downtime duration for the dashboard scope. |
| Active/Expiring/Expired AMC Contracts | Current contract health; expiring means within 30 days. |
| AMC Covered/Without AMC Equipment | Identifies protection gaps before a failure occurs. |
| Open/Critical/Unassigned/Overdue Requests | Maintenance demand requiring priority, assignment, or escalation. |
| Assigned and overdue work lists | Immediate work responsibility and missed planned dates. |
| Low-stock and reorder lists | Store action queues with available/minimum or requested quantities. |
| Equipment Status | Asset condition distribution. |
| Monthly Downtime | Current-year downtime hours by month. |
| Upcoming Maintenance | PM schedules due in the next 30 days. |
| Vendor Performance | Completed assignments grouped by vendor. |

Choose a site to refresh widgets within your authorized site list. A zero can mean no matching data; an error banner means one or more APIs failed. Example: a critical inverter communication failure appears in open/critical demand, while a cooling fan below minimum stock appears in the inventory widgets.

---

<!-- USERFILE:03-company-sites-people.md -->
## 3. Company, Sites, Employees, Roles, and Users

### Company profile

**Where:** Administration → Company · **Permissions:** `COMPANY_VIEW`, save with `COMPANY_CREATE` or `COMPANY_UPDATE`.

Use this page to maintain company code, name, contact details, address, status, and logo. Enter required code/name, optionally upload a safe image, and select **Save**. The record is refreshed after save; the logo is uploaded after the company record exists. There is no company delete action. Users without save permission see a read-only form.

### Sites

**Where:** Creation → Sites · **Permissions:** `SITE_VIEW`, `SITE_CREATE`, `SITE_UPDATE`, `SITE_DELETE`.

1. Select **Add Site**, enter Site Code and Site Name, then optional organization, type, address, contact, and coordinates.
2. Select **Save**. The site becomes available to equipment, employees, vendors, maintenance, downtime, stock, dashboards, and reports.
3. Open a row to view/edit it. Delete marks a site inactive rather than erasing referenced history.

Capacity and timezone fields are not implemented. Assign users only to the sites they operate; site access controls both dropdowns and records.

### Employees and login access

**Where:** Creation → Employees · **Permissions:** `EMPLOYEE_VIEW`, `EMPLOYEE_CREATE`, `EMPLOYEE_UPDATE`, `EMPLOYEE_DELETE`.

Create identity/contact/employment details, add at least one site assignment, and identify the primary site. To create application access, enable login, provide a unique username and temporary password, and add at least one permission-role assignment. Never send a password through screenshots or tickets. Save returns to the employee list. Common failures are duplicate sites, no primary assignment, password mismatch, or an inaccessible role/site.

**Teams are Not Available:** department/designation and free-text site role exist, but there is no Team master or team-assignment page.

### Roles, permissions, and user roles

**Where:** Administration → Roles / Permissions / User Roles.

- `ROLE_VIEW/CREATE/UPDATE/DELETE` controls role records. Create a code/name, status, and select permission checkboxes. Changes affect users assigned that role; a fresh login may be needed to refresh the UI session.
- `PERMISSION_VIEW` opens the read-only permission catalogue.
- **User Roles is Partially Available:** `USER_ROLE_VIEW` opens an informational placeholder. Backend role-assignment APIs exist, but the editor is not functional.
- **Create User** exists at `/create-user` with `USER_ROLE_ASSIGN`; employee creation is the more complete site/role-aware onboarding path.

Avoid granting create/update/delete simply because view is needed. Example: a technician can receive `EQUIPMENT_VIEW`, `REQUEST_VIEW`, and assignment/work-log permissions, while a store user receives spare and stock-processing permissions.

---

<!-- USERFILE:04-vendors-amc-equipment.md -->
## 4. Vendors, AMC, and Equipment

### Vendors

**Where:** Masters → Vendors · **Permissions:** `VENDOR_VIEW/CREATE/UPDATE/DELETE`.

Vendors represent inverter manufacturers, SCADA support firms, tracker providers, transformer specialists, and spare suppliers. Create a vendor with code, name, type, contacts, tax/address data, status, and supported sites. Save returns to the list. Open a row for details, related equipment, and available history; edit only with update permission. Inactive vendors should not be selected for new work.

### Annual Maintenance Contracts (AMC)

**Where:** Masters → Vendor AMC · **Permissions:** `VENDOR_AMC_VIEW/CREATE/UPDATE/DELETE`; special actions `VENDOR_AMC_ASSIGN_EQUIPMENT`, `VENDOR_AMC_RENEW`.

AMC means Annual Maintenance Contract. It connects a vendor, contract dates/SLA/coverage, and selected equipment.

1. Select **Create AMC**, choose vendor/site, enter contract number, dates, SLA, coverage, value/status, and covered equipment.
2. Save and open the contract view to inspect coverage.
3. Use **Renew** to create linked renewal history; do not overwrite an expired contract.
4. During a maintenance request, the system can retain AMC vendor/contract references for covered equipment.

Expiry information is available in dashboard/notifications where configured. AMC approval is not a dedicated user workflow. Labor/spares are captured as coverage information; there is no full vendor portal.

### Equipment

**Where:** Masters → Equipment · **Permissions:** `EQUIPMENT_VIEW/CREATE/UPDATE/DELETE`.

Use equipment records for central/string inverters, transformers, trackers, combiner boxes, weather stations, pyranometers, SCADA servers, pumps, DG sets, and UPS units.

1. Search/filter the list, then click a row or view icon.
2. Review identity, site, category/type, vendor, model, serial number, criticality, status, warranty, and parent equipment.
3. Select **Edit** if permitted, update fields, and save.
4. Use view-page sections for AMC, maintenance, downtime, and spare-related context where data is exposed.

Category and type values are entered/handled by the existing equipment form; separate category/type master pages do not exist. **Meter Readings are Partially Available:** backend meter-reading support exists, but the current frontend has no dedicated meter/runtime route or usable reading tab. Automatic SCADA/historian ingestion is Not Available.

---

<!-- USERFILE:05-maintenance.md -->
## 5. Maintenance Requests, Assignments, Work Logs, and Downtime

### Maintenance requests

**Where:** Maintenance → Requests · **Permissions:** `REQUEST_VIEW/CREATE/UPDATE/DELETE`.

Create a request when equipment needs corrective or inspection work—for example, inverter communication failure or transformer oil leakage. Select site/equipment, enter title and issue description, priority/type/status and relevant dates/attachments shown by the form, then save/submit. The request becomes visible to permitted site users and can enter approval or assignment according to configuration. Open a row to see details, edit in allowed states, and follow its assignments, work, downtime, and spares.

Do not duplicate an open request for the same symptom. Use a clear observable problem, not only “not working.” The exact lifecycle is represented by the status shown on the record; action buttons are permission- and state-dependent.

### Assignments and technician work

**Where:** Maintenance → Assignments · **Permissions:** `ASSIGNMENT_VIEW/CREATE/UPDATE/DELETE` plus action APIs exposed on the assignment view.

1. Create an assignment from/for a maintenance request.
2. Select responsible technician/employee or vendor as supported, planned start/end, priority, and instructions.
3. Save; the assignee can open the record and perform available start/status actions.
4. Add checklist responses and work logs. Record issue found, action taken, notes, time, attachments, and completion status.
5. Request required spares from the assignment workflow; after work and checks are complete, complete the assignment/request using the available action.

Multiple work logs can preserve the sequence of diagnosis and repair. Example: “Loose communication cable in inverter control panel” followed by “Cable reseated, terminal tightened, communication verified.” These records contribute to equipment maintenance history.

### Downtime

**Where:** Maintenance → Downtime · **Permissions:** `DOWNTIME_VIEW/CREATE/UPDATE/DELETE`; actions `DOWNTIME_CONFIRM`, `DOWNTIME_VERIFY`, `DOWNTIME_CLOSE`, `DOWNTIME_REOPEN`, `DOWNTIME_RCA_MANAGE`.

Create downtime with site/equipment, start time, type/reason/category, request linkage, and production-loss information available on the form. Leave end time open while the outage continues. Authorized users progress confirm/verify/close actions; closing requires the necessary end and review information. RCA captures cause and corrective/preventive action. Reopen only when closure was incorrect or the event continues.

Downtime Analysis reports event count, unplanned events, and duration. Accurate timestamps are essential for production-impact reporting.

---

<!-- USERFILE:06-preventive-maintenance.md -->
## 6. Preventive Maintenance

**Where:** Maintenance → Preventive Maintenance / PM Calendar  
**Current permissions:** list/view uses `REQUEST_VIEW`, create uses `REQUEST_CREATE`, edit uses `REQUEST_UPDATE`; calendar uses `PM_CALENDAR_VIEW`.

Preventive maintenance schedules recurring work before failure—for example monthly inverter inspection, quarterly transformer thermography, tracker lubrication, pyranometer calibration, module cleaning, or SCADA backup.

1. Select **New**, choose site/equipment, provide schedule title/type, frequency and interval, start/next due information, responsibility, checklist, priority, and activation details exposed by the form.
2. Save. The schedule appears in the PM list and calendar and contributes to upcoming-maintenance dashboard data.
3. Open the schedule to review execution history and available actions.
4. When due, create/execute the related maintenance work through the current request/assignment flow, complete checklist/work logs, and confirm the next due date is advanced.

The calendar helps planners see date-based demand. Overdue means the due date passed without completion. **Meter-based PM is Partially Available:** backend meter capability exists, but there is no current end-user meter-reading page to operate the full threshold flow. **PM spare-parts forecasting/BOM planning is Not Available** in the current application; it remains a proposed future feature, not part of this manual's operating steps.

---

<!-- USERFILE:07-spares-inventory.md -->
## 7. Spare Parts, Inventory, Fulfilment, and Reorders

### Spare master and stock

**Where:** Inventory → Spare Parts · **Permissions:** `SPARE_PART_VIEW/CREATE/UPDATE/DELETE`; transactions use `STOCK_TRANSACTION_VIEW/CREATE`.

Create parts such as IGBT modules, DC fuses, cooling fans, tracker motors, communication cards, MC4 connectors, batteries, or bearings. Maintain part code/name, category, unit, compatible equipment, preferred vendor, minimum/reorder levels, unit cost, status, and site stock information exposed by the page.

The view page provides stock and transaction actions such as receipt, adjustment, transfer, and movement history when permitted. Always choose the correct site and storage location. Available stock is calculated as:

`Available Stock = Current Stock − Reserved Stock`

A reservation prevents the same units being promised twice. An adjustment corrects a verified physical discrepancy; it is not a substitute for receipt, issue, return, or transfer.

### Spare request and fulfilment

**Permissions:** request/usage actions are embedded in maintenance/assignment views; manager page uses `SPARE_USAGE_MANAGER_APPROVE`; store page uses `SPARE_USAGE_STORE_PROCESS`; special actions use `SPARE_USAGE_RESERVE`, `SPARE_USAGE_ISSUE`, `SPARE_USAGE_CONSUME`.

1. Technician requests a part and quantity against the maintenance work, with reason.
2. Manager opens **Spare Approval** and approves or rejects.
3. Store opens **Approved Spare Requests**, checks available stock, then reserves and issues with the relevant permissions.
4. Technician/store records consumption or return from the supported action.
5. Each action updates request status, reservation, and stock movement history.

**Partial issue is Partially Available:** quantity/status fields support fulfilment actions, but a robust multi-lot partial-issue user journey is not fully represented. Do not promise more than available stock. If unavailable, use a transfer when stock exists at another permitted site or create/manage a reorder.

### Reorders and receipts

**Where:** Inventory → Reorder Requests · **Permissions:** `REORDER_VIEW/CREATE/UPDATE`.

Create a reorder for a site/part, requested quantity, expected date, vendor/cost details and notes shown by the dialog. Progress its status and record receipt using the available action; a receipt creates stock movement and raises on-hand quantity. The current feature is a reorder/purchase-request-like workflow, not a complete purchase-order, quotation, invoice, or accounts-payable module.

Inter-site stock transfer is available from stock operations where permitted. Automatic suggested transfers and automatic purchase requests based on upcoming PM/BOM shortages are Not Available.

---

<!-- USERFILE:08-approvals-notifications.md -->
## 8. Approvals and Notifications

### Approval inbox and history

**Where:** Approvals → Pending Approvals / Approval History · **Permissions:** `APPROVAL_VIEW`, `APPROVAL_APPROVE`, `APPROVAL_REJECT`.

Filter pending work by module, action, site, status, and request date. Select **View** to inspect reference, requester, and remarks. Approve when the request is valid and within authority; reject with an actionable reason. The decision leaves the inbox and appears in history. Approval configuration controls module/action behavior and approver role where implemented.

**Administration → Approval Configuration:** `APPROVAL_CONFIG_VIEW/UPDATE`. The page edits configured approval rows. Creation exists at service level but the present UI is primarily edit-oriented.

### Notification center

**Where:** bell or `/notifications` · **Permissions:** `NOTIFICATION_VIEW`, update actions with `NOTIFICATION_UPDATE`.

Use tabs for All, Unread, Read, Archived, PM, Overdue, Approval, and High Priority. Opening an unread item can mark it read; use **Mark All Read** or archive when permitted. The application supports live event-stream updates when the connection is available.

Notification Settings (`NOTIFICATION_CONFIG_VIEW/UPDATE`) configure event/role/channel behavior. Current notification types include PM due reminders, overdue requests, approval pending, and other configured workflow events. Email works only when server SMTP and settings are enabled; users cannot configure SMTP secrets in the UI. Low-stock and AMC expiry are visible in dashboard features and may produce notifications only where the backend event is configured.

---

<!-- USERFILE:09-reports.md -->
## 9. Reports

**Where:** Reports · **Permission:** `REPORT_VIEW`.

| Report | Current purpose and filters |
|---|---|
| Equipment History | Select equipment/site as offered; review requests, assignments, and downtime events with pagination. |
| Downtime Analysis | Filter by equipment/site; review event count, unplanned events, total hours/minutes, and event rows. |
| Equipment Cost | Switch among Equipment Maintenance Cost, Cost by Site, Cost by Category, and Cost by Criticality; filter by site/equipment where available. |

Use Equipment History to prepare an inverter reliability review, Downtime Analysis for monthly production-loss meetings, and Equipment Cost to locate expensive asset classes. Results respect site access. **Exports are Not Available** in the inspected report pages: there is no current CSV/PDF/export action. PM compliance, inventory stock, low-stock, spare usage, vendor performance, AMC expiry, and technician-work reports are Not Available as dedicated report pages, although some of those indicators exist on dashboards or record views.

---

<!-- USERFILE:10-common-behavior.md -->
## 10. Common List, View, and Form Behavior

### Lists and views

- Search and filters narrow data; clear them before assuming a record is missing.
- Pagination loads another result page. Sorting support depends on the current grid/column.
- Click a row or **View** icon to open details. Select **Edit** only when the button is visible and the record state permits it.
- Create, edit, delete, approve, issue, consume, return, and special buttons are independently permission-controlled.
- Loading indicators mean the request is in progress. An empty state means no matching accessible rows. An error banner means the API failed or access was denied.
- Delete may inactivate or soft-delete master data; it should not be used for historical transactions.

### Forms

1. Complete fields marked required. Type in autocomplete fields and choose an offered record.
2. Observe dependent fields: site selection often controls equipment, vendor, employee, stock, and maintenance options.
3. Select **Save/Submit** once. Validation messages identify missing or invalid data.
4. On success, the application normally shows a message and returns to the list or refreshes the saved view.
5. **Cancel** discards current edits. There is no guaranteed unsaved-changes confirmation on every page.

Disabled fields may be system-controlled, state-controlled, or read-only due to permission. Upload only business-safe files of accepted type/size. Do not use browser Back during an active save.

---

## 11. Role-Based Quick Guides

Roles are configurable; the following are recommended operating patterns, not guaranteed grants.

### Admin / Super Admin

Daily path: Dashboard → review access/alerts → maintain company/sites/employees → roles/permissions → approval and notification settings. Keep least privilege, verify new users' sites, and test permission changes with a non-admin account. Super Admin/Admin bypass behavior may broaden access; use these roles sparingly.

### Plant Manager

Daily path: Dashboard → critical/overdue work → pending approvals → downtime → PM Calendar → reports. Approve only records for authorized sites and escalate production-impacting downtime.

### Maintenance Manager / Engineer

Daily path: Requests → create/triage → Assignments → check work logs/spares → Downtime/RCA → PM list/calendar → close verified work. Ensure equipment, priority, planned dates, and root cause are meaningful.

### Technician

Daily path: Assignments → open assigned work → record checklist/work log → request spare if needed → record action/evidence → complete. Technicians normally view masters but should not administer them.

### Store Manager / Inventory Executive

Daily path: low-stock dashboard → Spare Approval or Approved Spare Requests → reserve → issue → receipt/return/consume → Reorder Requests → verify stock movements. Separate manager approval from physical store processing where staffing permits.

### HR / Administrator

Daily path: Sites → Employees → login/site/role assignment. Confirm primary site, active status, and correct role before handing over access.

### Viewer / Demo User

Use dashboard, permitted lists/views, notifications, and reports. Create/edit/action buttons should be absent. Never use production customer data in demonstrations.

---

## 12. End-to-End Workflows

### Equipment onboarding

`Company → Site → Vendor → Equipment → AMC → PM Schedule`

Create foundations in that order so dropdown dependencies exist. Meter configuration is excluded because no complete current frontend flow exists.

### Breakdown maintenance

`Issue reported → Request → optional approval → Assignment → Work log/checklist → Spare request/issue/consume → Downtime closure/RCA → Work closure`

Each handoff preserves site/equipment references. If downtime is open, do not close the maintenance record without reconciling the event.

### Preventive maintenance

`PM schedule → dashboard/calendar reminder → maintenance execution/assignment → checklist/work log → completion → next due date`

Confirm the generated or linked work and next due date; otherwise a completed inspection can still appear overdue.

### Spare and inventory

`Spare master/site stock → technician request → manager approval → store reserve → issue → consume or return → movement history`

If short: `other-site stock transfer` or `reorder → receipt → stock update`.

### AMC maintenance

`Covered equipment issue → AMC identified → vendor-related assignment/support → SLA and work evidence → closure`

Preserve the contract/vendor reference for warranty and performance history.

### Meter-based maintenance

**Partially Available:** `Reading → threshold → PM due` has backend foundations, but the current UI does not provide an end-to-end reading/correction/threshold workflow.

---

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

### Feature availability matrix

| Module | Feature | Status | Notes |
|---|---|---|---|
| Authentication | Login/logout/session/access denied | Available | Change Password and forced first-login change are partial/not routed |
| Dashboard | Role/site-aware metrics and widgets | Available | Card click-through is not consistently implemented |
| Company/Site | Profile, logo, site CRUD | Available | Site capacity/timezone not implemented |
| Employees | Employee, site, login, role assignment | Available | No Team master |
| Access | Roles and permission catalogue | Available | User Roles editor Partially Available |
| Vendor/AMC | Vendor CRUD, contracts, equipment coverage, renewal | Available | No vendor self-service portal |
| Equipment | CRUD and linked operational context | Available | No separate category/type masters |
| Requests | Create/view/edit and downstream work | Available | State-dependent actions vary |
| Assignments | Assignment, checklist, work log, attachments/spares | Available | Technician acceptance is not a distinct documented feature |
| Downtime | Event lifecycle, RCA, reporting | Available | — |
| PM | Schedule, list, view, calendar | Available | Uses request permissions; meter PM partial |
| Meter/runtime | Backend foundations | Partially Available | No usable frontend route; no SCADA ingestion UI |
| Spares/stock | Master, site stock, movements, transfer | Available | Partial-issue journey incomplete |
| Reorder/purchase request | Reorder, status, receipt | Available | Not a complete procurement/PO/invoice system |
| Approvals | Inbox, decisions, history, config | Available | Config create journey edit-oriented |
| Notifications | Bell/center/read/archive/settings/live stream | Available | Email depends on external SMTP/config |
| Reports | Equipment history, downtime, equipment cost | Available | No export; other requested reports absent |
| Profile | Navbar identity/logout/theme | Partially Available | No dedicated editable profile/change-password route |
| PM spare planning | BOM-based forecast/transfers/purchase suggestions | Not Available | Proposed future feature only |

---

<!-- USERFILE:11-troubleshooting.md -->
## 14. Troubleshooting

| Problem | Check and resolution |
|---|---|
| Page not visible | Role lacks view permission, user lacks site assignment, or menu is intentionally hidden. Ask admin to review role and sign in again. |
| 403 Access Denied | A page/action/helper API or record/site check failed. Give admin the action, time, URL, and correlation ID—never the token. |
| Dropdown empty | Create/activate prerequisite master data, choose the parent site first, clear filters, and verify helper-API permission/site access. |
| Save button absent/disabled | Create/update permission is missing, record state forbids editing, or the page is read-only. |
| Record missing | Clear search/status/site filters, check pagination and site access, and confirm it was not inactivated. |
| Validation message | Correct highlighted required, date, quantity, password, or dependent fields; do not repeatedly submit unchanged data. |
| Stock unavailable | Check Current, Reserved, and Available. Release invalid reservations, return unused parts, transfer permitted stock, or reorder. |
| Lower meter reading rejected | The full correction UI is not currently available; contact an authorized administrator/support team rather than entering false data. |
| Notification absent | Verify notification setting, recipient role, site, browser/live connection, and email server configuration. |
| Dashboard empty | Confirm the role has widgets assigned, choose a permitted site, and check whether source records exist. |
| Change Password returns elsewhere | Current route is not implemented. Use the administrator-approved password reset process. |

## 15. Glossary

| Term | Plain-language meaning |
|---|---|
| CMMS | System for planning, recording, and analysing maintenance work. |
| AMC | Annual Maintenance Contract with a service vendor. |
| PM | Preventive Maintenance performed before failure. |
| Downtime | Time when equipment cannot perform its intended operation. |
| MTBF | Average operating time between failures; not a current dedicated report. |
| MTTR | Average time to restore equipment; not a current dedicated report. |
| SLA | Agreed service response/resolution target. |
| SCADA | Supervisory system that monitors and controls plant equipment. |
| Historian | Time-series store for operational readings; no current UI integration. |
| Inverter | Converts solar DC power to AC power. |
| String Combiner Box | Combines multiple PV string circuits before inversion. |
| Criticality | Business/production importance of an asset. |
| Reserved Stock | On-hand quantity promised to approved work but not yet issued. |
| Available Stock | Current stock minus reserved stock. |
| Work Log | Technician record of diagnosis, action, time, and evidence. |
| Meter Reading | Cumulative runtime, energy, cycle, or count value for equipment. |
| RCA | Root Cause Analysis explaining why an event happened and prevention action. |

## Appendix A — Screenshot index

| Figure | File | Status |
|---|---|---|
| Figure 1.1 – Login page | [01-login-page.png](screenshots/01-login-page.png) | Captured safely; public page |
| Authenticated pages | [Screenshot register](screenshots/README.md) | Pending approved interactive capture; backend was unavailable during the port-6200 pass |

The frontend at port 6200 was reachable and reviewed. Authenticated screenshots could not be regenerated because the backend on configured port 4111 was not running. Existing source-verified documentation and the safe login image were retained; no credentials were embedded to bypass authentication.

## Appendix B — Known gaps and inconsistencies

1. Preventive Maintenance reuses maintenance-request permissions instead of dedicated PM CRUD permission codes.
2. Navbar Change Password has no matching route/page.
3. User Roles renders a placeholder although backend APIs exist.
4. Meter-reading backend capability has no complete frontend route.
5. Role create/update may need permission-catalogue helper access beyond its own page permissions.
6. Reports do not expose export actions.
7. Site capacity/timezone, Team master, equipment category/type masters, complete procurement, and PM BOM spare forecasting are not implemented.
8. Some desired notification/report categories exist only as dashboard indicators, not dedicated user pages.

## Appendix C — Related references

- [Creation and transaction field guide](CMMS-Creation-Page-Documentation.md)
- [API dependency matrix](api-reference/API-Dependency-Matrix.md)
- [Database reference](database-reference/Database-Reference.md)
- [Field reference matrix](database-reference/Field-Reference-Matrix.md)
- [Screenshot register](screenshots/README.md)

