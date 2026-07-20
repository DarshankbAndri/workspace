# Vendor UI/UX And Functionality Improvement Plan

## Main Goal

The vendor page should work like a vendor operations profile, not only a vendor master form.

The vendor module should help users answer:

```text
Who is this vendor?
Which sites can use this vendor?
What AMC contracts are active?
Which equipment is covered?
Which jobs are pending with this vendor?
Is the vendor meeting SLA?
Which spare parts depend on this vendor?
Are documents and contact details complete?
```

## Production Design Principle

Do not make vendor isolated.

Vendor should link clearly with:

```text
Sites
AMC Contracts
Covered Equipment
Maintenance Requests
Assignments
Downtime
Spare Parts
Reorders
Documents
Reports
```

Correct production flow:

```text
Vendor Created
  -> Site assignment
  -> AMC contract created
  -> Equipment mapped to AMC
  -> Maintenance request identifies AMC/vendor
  -> Vendor assignment created
  -> Vendor work tracked
  -> SLA and performance reviewed
```

## 1. Vendor View Page Improvements

### 1.1 Vendor Profile Header

Show a compact profile header at the top of vendor view.

Recommended fields:

```text
Vendor Code
Vendor Name
Active Status
Service Category
Assigned Site Count
Active AMC Count
Expiring AMC Count
Open Vendor Jobs
Primary Contact
Phone / Email
```

This helps users understand vendor status immediately.

### 1.2 Vendor Health Warnings

Show warning chips/cards when vendor setup has issues:

```text
No site assigned
No contact person
No phone number
No email
No active AMC
AMC expiring soon
Inactive vendor has active AMC
Vendor has open overdue jobs
Vendor has SLA breaches
```

These warnings are useful for admin and maintenance teams.

### 1.3 Smart Action Buttons

Show actions based on permission and data.

| Action | Show When | Permission |
|---|---|---|
| Edit Vendor | Vendor is editable | `VENDOR_UPDATE` |
| Create AMC | Vendor is active | `VENDOR_AMC_CREATE` |
| View AMC Contracts | AMC exists | `VENDOR_AMC_VIEW` |
| Renew AMC | AMC is expiring/expired | `VENDOR_AMC_RENEW` |
| View Covered Equipment | Equipment mappings exist | `EQUIPMENT_VIEW` |
| View Vendor Jobs | Vendor has assignments | `ASSIGNMENT_VIEW` |
| View Spare Parts | Vendor is preferred supplier | `SPARE_PART_VIEW` |

Important:

- Do not depend on role names.
- Use permissions and data availability.
- Hide actions the user cannot perform.

## 2. Vendor Detail Tabs

Recommended tabs in vendor view:

```text
Overview
Sites
AMC Contracts
Covered Equipment
Open Jobs
SLA Performance
Spare Parts
Documents
History
```

Show a tab only when useful data exists or the user has permission.

Example:

```text
Show AMC Contracts tab only if user has VENDOR_AMC_VIEW.
Show Spare Parts tab only if user has SPARE_PART_VIEW.
Show Open Jobs tab only if user has ASSIGNMENT_VIEW.
```

## 3. Vendor List Page Improvements

### 3.1 Queue Tabs

Add quick tabs with counts:

```text
All
Active
Inactive
No Site Assigned
Has Active AMC
AMC Expiring
Open Jobs
SLA Breach
Missing Contact
```

This makes the vendor list useful for daily admin and AMC review.

### 3.2 Better Columns

Recommended vendor list columns:

```text
Vendor Code
Vendor Name
Service Category
Status
Primary Site
Assigned Sites
Active AMC
Expiring AMC
Open Jobs
Contact Person
Phone
Email
Actions
```

### 3.3 Row Highlighting

Use subtle row styling:

```text
Inactive vendor with active AMC: error marker
AMC expiring soon: warning marker
Missing contact: info/warning marker
Open overdue jobs: warning marker
```

## 4. AMC Contract Improvements

### 4.1 AMC View Summary Cards

AMC contract view should show quick cards:

```text
Contract Status
Days Remaining
Covered Equipment Count
Open Vendor Jobs
PM Schedule Count
Response SLA
Resolution SLA
Contract Value
```

### 4.2 AMC Warnings

Show warnings:

```text
AMC expired
AMC expiring soon
No equipment mapped
Response SLA missing
Resolution SLA missing
Contact person missing
Contract value missing
Coverage dates invalid
```

### 4.3 AMC Equipment Mapping UX

Improve covered equipment section:

```text
Search equipment
Filter by equipment category
Filter by criticality
Show already covered equipment disabled
Show coverage start/end
Show coverage type
Link to equipment view
```

## 5. Linking Improvements

### 5.1 Links From Vendor View

Vendor view should have direct links:

| Related Item | Link |
|---|---|
| AMC Contract | `/vendor-amc/view/{contractId}` |
| Covered Equipment | `/equipment/{equipmentId}/view` |
| Maintenance Assignment | `/maintenance/assignments/{assignmentId}/view` |
| Maintenance Request | `/maintenance/requests/{requestId}/view` |
| Spare Part | `/inventory/spare-parts/{stockId}/view` |
| Reorder | `/inventory/reorders` with vendor filter |
| Site | `/hr/sites/{siteId}/view` |

### 5.2 Links From Other Pages To Vendor

Other modules should link back to vendor:

```text
AMC View -> Vendor View
Equipment View -> Active AMC Vendor
Request View -> AMC/Vendor
Assignment View -> Vendor
Spare Part View -> Preferred Vendor
Reorder View -> Preferred Vendor
Dashboard Vendor Widgets -> Vendor View / AMC View
```

## 6. Vendor Jobs

Vendor jobs are assignments where vendor is selected.

Vendor view should show:

```text
Open vendor assignments
In progress vendor assignments
Overdue vendor assignments
Completed vendor assignments
Linked request number
Linked equipment
Target/planned date
Assigned date
Actual completion date
Status
```

Recommended filter shortcuts:

```text
All Vendor Jobs
Open
Assigned
In Progress
Overdue
SLA Breached
Completed
```

## 7. Vendor SLA Performance

### 7.1 Performance Metrics

Show vendor performance summary:

```text
Total jobs
Open jobs
Completed jobs
Jobs completed on time
Average response time
Average resolution time
SLA breached jobs
Repeated failure equipment
Average actual cost
```

### 7.2 SLA Calculation

Use AMC contract SLA:

```text
Response SLA = time from request/assignment creation to work start
Resolution SLA = time from request/assignment creation to completion
```

If actual start/end fields are missing, show:

```text
SLA cannot be calculated because work dates are missing.
```

Do not show false performance numbers.

## 8. Spare Parts Supplier View

If vendor is preferred supplier for spare parts, vendor view should show:

```text
Preferred spare parts
Low stock spare parts
Open reorder requests
Last reorder date
Current stock
Minimum stock
Unit cost
Storage location
```

Useful links:

```text
Open spare part
Open reorder page
Create reorder
```

Permissions:

```text
SPARE_PART_VIEW
REORDER_VIEW
REORDER_CREATE
```

## 9. Documents And Compliance

Vendor should support documents:

```text
Contract copy
GST / tax document
Insurance document
Compliance certificate
Safety certificate
Bank details
Vendor service report
Other document
```

Recommended fields:

```text
Document Type
File Name
Uploaded By
Uploaded At
Expiry Date
Description
```

Permissions:

```text
VENDOR_DOCUMENT_VIEW
VENDOR_DOCUMENT_UPLOAD
VENDOR_DOCUMENT_DELETE
```

This may require a new table.

## 10. Backend API Improvements

### 10.1 Vendor Profile Summary API

Use one optimized API for vendor view summary:

```text
GET /api/vendors/{id}/profile-summary
```

Permission:

```text
VENDOR_VIEW
```

Response example:

```json
{
  "vendorId": 5,
  "vendorCode": "VEN-001",
  "vendorName": "ABC Services",
  "active": true,
  "serviceCategory": "Electrical",
  "assignedSiteCount": 3,
  "activeAmcCount": 2,
  "expiringAmcCount": 1,
  "coveredEquipmentCount": 18,
  "openJobCount": 4,
  "overdueJobCount": 1,
  "preferredSpareCount": 12,
  "missingContact": false,
  "warnings": ["AMC_EXPIRING_SOON"]
}
```

### 10.2 Vendor Jobs API

```text
GET /api/vendors/{id}/jobs
```

Permission:

```text
ASSIGNMENT_VIEW
```

Response should be paginated in final production implementation.

Fields:

```text
assignmentId
requestId
requestNumber
equipmentId
equipmentCode
equipmentName
siteName
status
assignedDate
plannedEndDate
actualEndDate
```

### 10.3 Vendor Performance API

```text
GET /api/vendors/{id}/performance
```

Permission:

```text
VENDOR_VIEW
```

Response:

```json
{
  "totalJobs": 20,
  "openJobs": 4,
  "completedJobs": 16,
  "onTimeCompletionCount": 13,
  "slaBreachCount": 3,
  "averageResolutionHours": 18.5,
  "totalActualCost": 45000
}
```

### 10.4 Vendor Spare Parts API

```text
GET /api/vendors/{id}/spare-parts
```

Permission:

```text
SPARE_PART_VIEW
```

### 10.5 Vendor Queue Summary API

For vendor list tabs:

```text
GET /api/vendors/queue-summary
```

Permission:

```text
VENDOR_VIEW
```

Response:

```json
{
  "all": 45,
  "active": 39,
  "inactive": 6,
  "noSiteAssigned": 4,
  "hasActiveAmc": 12,
  "amcExpiring": 3,
  "openJobs": 8,
  "slaBreach": 2,
  "missingContact": 5
}
```

## 11. API Permission Mapping

Add rows in:

```text
cmms_back_end/src/main/resources/api-permission-mapping.csv
```

Recommended rows:

```csv
VENDOR_VIEW,/api/vendors/*/profile-summary,GET,View vendor profile summary
ASSIGNMENT_VIEW,/api/vendors/*/jobs,GET,View vendor jobs
VENDOR_VIEW,/api/vendors/*/performance,GET,View vendor performance
SPARE_PART_VIEW,/api/vendors/*/spare-parts,GET,View vendor preferred spare parts
VENDOR_VIEW,/api/vendors/queue-summary,GET,View vendor queue summary
VENDOR_DOCUMENT_VIEW,/api/vendors/*/documents,GET,View vendor documents
VENDOR_DOCUMENT_UPLOAD,/api/vendors/*/documents,POST,Upload vendor document
VENDOR_DOCUMENT_DELETE,/api/vendors/*/documents/*,DELETE,Delete vendor document
```

Important:

- API access must stay centralized in `JwtFilter` and `ApiPermissionService`.
- Do not add normal permission checks in controllers/services.
- Keep site and record-level checks in services.

## 12. Performance Rules

### 12.1 Vendor List

Do not load all vendors and calculate everything in frontend.

Use:

```text
Server-side pagination
Server-side filtering
Server-side sorting
Indexed vendor status/site/category fields
Count queries for queue summary
```

### 12.2 Vendor Profile

Use summary/count queries:

```text
count active AMC by vendor
count expiring AMC by vendor
count covered equipment by vendor
count open assignments by vendor
count overdue assignments by vendor
count preferred spare parts by vendor
```

Avoid:

```text
load all AMC contracts and count in Java
load all assignments and count in Java
load all spare parts only to count preferred vendor usage
```

### 12.3 Site Scoping

Every vendor API must respect site access:

```text
If siteId is passed, validate access.
If vendor has site assignments, return only allowed-site data.
If no site access, do not expose vendor operational data.
Admin can see all sites.
```

## 13. Frontend Structure

Use existing module structure:

```text
cmms_front_end/src/features/vendor/
    pages/
    components/
    services/
    hooks/
    constants/
```

Recommended components:

```text
components/VendorProfileHeader.jsx
components/VendorHealthWarnings.jsx
components/VendorSmartActions.jsx
components/VendorSitePanel.jsx
components/VendorAmcContractsTab.jsx
components/VendorCoveredEquipmentTab.jsx
components/VendorJobsTab.jsx
components/VendorPerformancePanel.jsx
components/VendorSparePartsTab.jsx
components/VendorDocumentPanel.jsx
```

Recommended hooks:

```text
hooks/useVendorProfileSummary.js
hooks/useVendorJobs.js
hooks/useVendorPerformance.js
hooks/useVendorSpareParts.js
```

Recommended service functions:

```js
getVendorProfileSummary(vendorId)
getVendorJobs(vendorId, params)
getVendorPerformance(vendorId)
getVendorSpareParts(vendorId)
getVendorQueueSummary(params)
```

## 14. User Benefit By User Type

### Manager / Supervisor

Useful improvements:

```text
Vendor profile summary
Open vendor jobs
Overdue vendor jobs
SLA performance
AMC expiry warnings
```

### AMC / Vendor Coordinator

Useful improvements:

```text
Active AMC list
Expiring contracts
Covered equipment
Renew AMC action
Vendor job queue
```

### Store User

Useful improvements:

```text
Preferred spare parts
Low stock parts from vendor
Reorder links
Supplier dependency visibility
```

### Maintenance User

Useful improvements:

```text
Vendor assignment visibility
Request to AMC/vendor link
Equipment coverage clarity
Vendor contact details
```

### Admin / Audit User

Useful improvements:

```text
Vendor setup completeness
Assigned sites
Document compliance
History tab
Inactive vendor warnings
```

## 15. Implementation Phases

### Phase 1: Low Risk UI Linking

Build:

```text
Vendor profile header
Status/contact warning chips
AMC contract links
Covered equipment links
Create AMC button with vendor prefill
Vendor view tabs
```

No database change required.

### Phase 2: Summary And Job APIs

Build:

```text
GET /api/vendors/{id}/profile-summary
GET /api/vendors/{id}/jobs
GET /api/vendors/{id}/performance
GET /api/vendors/queue-summary
```

Add API permission mapping rows.

### Phase 3: Spare Supplier Integration

Build:

```text
Vendor spare parts tab
Preferred spare count
Low stock vendor spare list
Reorder links
```

### Phase 4: AMC Production Polish

Build:

```text
AMC warnings
SLA cards
Equipment coverage filters
Renewal shortcut
Open vendor jobs from AMC
```

### Phase 5: Vendor Documents

Build:

```text
Vendor document table
Upload API
Download API
Delete API
Document expiry warning
Permissions for vendor documents
```

This may require a new table.

## Final MVP

Build this first:

```text
1. Vendor profile summary header
2. Vendor health warnings
3. Vendor tabs: Sites, AMC Contracts, Covered Equipment, Open Jobs, Spare Parts
4. Create AMC from vendor with vendor prefilled
5. Vendor job queue and links to assignment/request/equipment
6. AMC expiry and missing-data warnings
```

This will make the vendor module more useful for AMC management, service coordination, store dependency tracking, and production decision-making.
