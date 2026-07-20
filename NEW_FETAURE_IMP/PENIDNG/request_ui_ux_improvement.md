# Maintenance Request UI/UX And Functionality Improvement Plan

## Main Goal

The maintenance request page should work like a production work queue, not only a create/edit/view form.

The request module should help users answer:

```text
What happened?
Where did it happen?
How urgent is it?
Who must act next?
Is it approved?
Is it assigned?
Is AMC/vendor involved?
Is the request overdue?
What related records are linked?
```

## Production Design Principle

Do not make the request page isolated.

Maintenance request should link clearly with:

```text
Site
Equipment
AMC Contract
Approval
Assignment
Downtime
Spare Usage
Documents / Photos
Reports
```

Correct production flow:

```text
Request Created
  -> Approval if required
  -> Open request queue
  -> Assignment created
  -> Technician works
  -> Spare usage / downtime linked if needed
  -> Completion
  -> Closure / verification
```

## 1. Request View Page Improvements

### 1.1 Lifecycle Timeline

Show a visual timeline at the top of request view.

Example:

```text
Created -> Pending Approval -> Open -> Assigned -> In Progress -> Completed -> Closed
```

Each step should show:

```text
Status
Date/time
User name
Remarks if available
```

This helps manager and technician understand the current stage immediately.

### 1.2 Request Summary Header

At the top of view page, show important information in a compact header:

```text
Request Number
Status
Priority
Request Type
Equipment
Site
Ageing
Target Completion Date
```

Priority and status should use colored chips.

Example:

```text
CRITICAL - red
HIGH - orange
MEDIUM - blue
LOW - gray
```

### 1.3 Smart Action Buttons

Show action buttons based on request status and permissions.

| Action | Show When | Permission |
|---|---|---|
| Edit Request | Request is editable | `REQUEST_UPDATE` |
| Approve | Request is pending approval | `APPROVAL_APPROVE` |
| Reject | Request is pending approval | `APPROVAL_REJECT` |
| Create Assignment | Request is open and not assigned | `ASSIGNMENT_CREATE` |
| View Assignment | Assignment exists | `ASSIGNMENT_VIEW` |
| Put On Hold | Request is open/in progress | `REQUEST_UPDATE` |
| Reopen | Request is closed/completed | `REQUEST_UPDATE` |
| Close Request | Work is completed | `REQUEST_UPDATE` |
| Create Downtime | Breakdown request | `DOWNTIME_CREATE` |
| Request Spare | Work requires spare | `SPARE_USAGE_CREATE` |

Important:

- Do not show unavailable actions.
- Do not depend on role names.
- Use permissions and status to decide visibility.


```

## 3. Create / Edit Request Form Improvements

### 3.1 Equipment Context Panel

When user selects equipment, show a small context panel:

```text
Equipment Code
Equipment Name
Site
Current Status
Open Request Count
Active AMC
Last Maintenance Date
Next PM Date
Spare BOM Count
```

This prevents duplicate requests and helps user create better requests.

### 3.2 Duplicate Open Request Warning

If selected equipment already has open requests, show warning:

```text
This equipment already has 2 open requests.
```

Also show links:

```text
View existing open requests
Open latest request
```

This avoids duplicate breakdown tickets.

### 3.3 AMC Awareness

If equipment has active AMC, show:

```text
Covered by AMC
Vendor name
Contract number
Response SLA
Resolution SLA
AMC expiry date
```

If no active AMC:

```text
No active AMC for this equipment.
```

This helps decide whether work should go to internal technician or vendor.

### 3.4 Priority Guidance

Add helper logic to suggest priority:

```text
Critical: equipment stopped / safety issue / production blocked
High: major impact but workaround available
Medium: normal maintenance
Low: observation / minor issue
```

Do not force priority automatically. Suggest and allow user to change.

## 4. Linking Improvements

### 4.1 Links From Request View

Request view should have direct links:

| Related Item | Link |
|---|---|
| Equipment | `/equipment/{equipmentId}/view` |
| Site | `/sites/{siteId}/view` or existing site route |
| AMC Contract | `/vendor-amc/view/{amcContractId}` |
| Assignment | `/maintenance/assignments/{assignmentId}/view` |
| Approval | Approval detail page |
| Downtime | Downtime detail page |
| Spare Usage | Spare usage detail page |

### 4.2 Links From Other Pages To Request

Other modules should link back to request:

```text
Equipment View -> Open Requests tab -> Request View
Assignment View -> Source Request
Downtime View -> Related Request
AMC View -> Requests covered by contract
Dashboard Widget -> Request List filtered by status
```

## 5. Request Detail Tabs

Recommended tabs in request view:

```text
Overview
Lifecycle
Assignment
Approval
AMC / Vendor
Downtime
Spare Usage
Documents
History
```

Show a tab only when useful data exists or the user has permission.

Example:

```text
Show AMC / Vendor tab only if request has AMC contract or user can view AMC.
Show Assignment tab only if assignment exists or user can create assignment.
```

## 6. Attachments And Proof

Add documents/photos section for request:

```text
Failure photo
Before repair photo
Safety observation photo
Supporting document
Vendor report
```

Useful fields:

```text
File name
File type
Uploaded by
Uploaded at
Description
```

Permissions:

```text
REQUEST_DOCUMENT_UPLOAD
REQUEST_DOCUMENT_VIEW
REQUEST_DOCUMENT_DELETE
```

## 7. Backend API Improvements

### 7.1 Request Context API

When creating or viewing request, frontend should not make many heavy calls.

Add one optimized context API:

```text
GET /api/maintenance/requests/context?equipmentId={equipmentId}
```

Permission:

```text
REQUEST_VIEW
```

Response should include:

```json
{
  "equipmentId": 10,
  "equipmentCode": "EQ-001",
  "equipmentName": "Main Pump",
  "siteId": 2,
  "siteName": "Plant A",
  "openRequestCount": 2,
  "latestOpenRequestId": 55,
  "activeAmcContractId": 8,
  "activeAmcContractNumber": "AMC-2026-001",
  "vendorName": "ABC Services",
  "responseTimeHours": 4,
  "resolutionTimeHours": 24,
  "lastMaintenanceDate": "2026-07-10",
  "nextPmDate": "2026-07-25",
  "spareBomCount": 6
}
```

### 7.2 Request Related Records API

For request view page:

```text
GET /api/maintenance/requests/{id}/related-records
```

Permission:

```text
REQUEST_VIEW
```

Response:

```json
{
  "assignment": {
    "id": 101,
    "status": "IN_PROGRESS",
    "technicianName": "Ravi"
  },
  "approval": {
    "id": 70,
    "status": "APPROVED"
  },
  "downtime": {
    "id": 12,
    "durationMinutes": 180
  },
  "spareUsages": []
}
```

### 7.3 Request Queue Summary API

For list page tabs:

```text
GET /api/maintenance/requests/queue-summary
```

Permission:

```text
REQUEST_VIEW
```

Response:

```json
{
  "pendingApproval": 4,
  "open": 18,
  "unassigned": 6,
  "assigned": 9,
  "inProgress": 5,
  "overdue": 3,
  "critical": 2,
  "completed": 11,
  "closed": 40
}
```

## 8. API Permission Mapping

Add rows in:

```text
cmms_back_end/src/main/resources/api-permission-mapping.csv
```

Recommended rows:

```csv
REQUEST_VIEW,/api/maintenance/requests/context,GET,View maintenance request equipment context
REQUEST_VIEW,/api/maintenance/requests/{id}/related-records,GET,View maintenance request related records
REQUEST_VIEW,/api/maintenance/requests/queue-summary,GET,View maintenance request queue summary
REQUEST_DOCUMENT_VIEW,/api/maintenance/requests/{id}/documents,GET,View maintenance request documents
REQUEST_DOCUMENT_UPLOAD,/api/maintenance/requests/{id}/documents,POST,Upload maintenance request document
REQUEST_DOCUMENT_DELETE,/api/maintenance/requests/{id}/documents/{documentId},DELETE,Delete maintenance request document
```

Important:

- API access must stay centralized in `JwtFilter` and `ApiPermissionService`.
- Do not add normal permission checks in controllers/services.
- Keep site and record-level checks in service.

## 9. Performance Rules

### 9.1 List Page

Do not load all requests for production list pages.

Use:

```text
Server-side pagination
Server-side filter
Server-side sorting
Indexed status/site/equipment/date fields
```

### 9.2 Context Data

Use summary/count queries instead of loading full records.

Good:

```text
count open requests by equipment
find latest open request top 1
count spare BOM rows
find active AMC top 1
```

Avoid:

```text
load all requests for equipment and count in Java
load all spare rows when only count is needed
load all assignments when only latest status is needed
```

### 9.3 Site Scoping

Every request API must respect site access:

```text
If siteId is passed, validate access.
If no siteId is passed, query only allowed site ids.
Admin can see all sites.
```

## 10. Frontend Structure

Use existing module structure:

```text
cmms_front_end/src/features/maintenanceRequest/
    pages/
    components/
    services/
    hooks/
    constants/
```

Recommended components:

```text
components/RequestLifecycleTimeline.jsx
components/RequestSummaryHeader.jsx
components/RequestSmartActions.jsx
components/RequestEquipmentContextPanel.jsx
components/RequestRelatedLinks.jsx
components/RequestQueueTabs.jsx
components/RequestAttachmentPanel.jsx
```

Recommended hooks:

```text
hooks/useRequestContext.js
hooks/useRequestRelatedRecords.js
hooks/useRequestQueueSummary.js
```

Recommended service functions:

```js
getRequestContext(equipmentId)
getRequestRelatedRecords(requestId)
getRequestQueueSummary(params)
```

## 11. User Benefit By User Type

### Manager / Supervisor

Useful improvements:

```text
Queue tabs
Critical and overdue highlighting
Ageing
Create assignment button
Request lifecycle
```

### Technician

Useful improvements:

```text
Clear equipment details
Failure photos
Spare request link
Assignment link
Work status visibility
```

### Store User

Useful improvements:

```text
Spare usage link
Equipment spare BOM visibility
Pending spare requests from maintenance request
```

### AMC / Vendor User

Useful improvements:

```text
AMC contract link
Vendor SLA information
Vendor-related request queue
```

### Admin / Audit User

Useful improvements:

```text
History tab
Approval history
Status transition audit
Documents
```

## 12. Implementation Phases

### Phase 1: Low Risk UI Linking

Build:

```text
Request summary header
Status/priority chips
Equipment view link
AMC view link
Assignment view/create button
Queue tabs on list page
```

No database change required.

### Phase 2: Context And Queue APIs

Build:

```text
GET /api/maintenance/requests/context
GET /api/maintenance/requests/queue-summary
GET /api/maintenance/requests/{id}/related-records
```

Add API permission mapping rows.

### Phase 3: Duplicate Request Prevention

Build:

```text
Open request warning on equipment selection
Existing request links
Latest open request shortcut
```

### Phase 4: Attachments

Build:

```text
Request document table
Upload API
Download API
Delete API
Permissions for request documents
```

This may require a new table.

### Phase 5: Production Polish

Build:

```text
Status lifecycle timeline
Action history
SLA ageing
Overdue indicators
Saved filters
Bulk action support
```

## Final MVP

Build this first:

```text
1. Queue tabs with counts
2. Request summary header
3. Smart action buttons
4. Equipment and AMC context panel
5. Related links from request view
6. Duplicate open request warning
```

This will make the maintenance request module much more useful for daily production users without changing the existing business flow.
