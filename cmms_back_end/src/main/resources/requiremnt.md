Update Maintenance Request, Maintenance Assignment, and Downtime pages to follow the same list + add form flow as Vendor module.

Current issue:
Requests, Assignments, and Downtime pages currently show creation form directly or mixed with list.

Required behavior:
Each module should have a landing list page first.
The list page should have filters, table, and Add button.
Only when user clicks Add, the creation page/form should open.
After successful save, navigate back to list page.

Apply this to:

1. Maintenance Requests
2. Maintenance Assignments
3. Downtime

IMPORTANT:
Frontend changes only unless route/API mismatch requires small service adjustment.
Do not change backend logic.
Do not change database.
Do not change authentication.
Do not change permission logic.
Do not break existing Vendor page.

Analyze existing Vendor module UI flow and copy the same pattern.

REQUEST MODULE

Create/update pages:

src/pages/maintenance/requests/MaintenanceRequestListPage.jsx
src/pages/maintenance/requests/MaintenanceRequestFormPage.jsx

Routes:

/maintenance/requests
/maintenance/requests/new
/maintenance/requests/:id/edit
/maintenance/requests/:id/view

Landing page:
- Show filters
- Show request list DataGrid
- Add Request button
- Edit/View/Delete actions based on existing permission helper if available

Filters:
- Site filter
- Status filter
- Priority filter
- Search by request title/equipment/site

Add button:
- Navigate to /maintenance/requests/new

After save:
- Navigate back to /maintenance/requests

ASSIGNMENT MODULE

Create/update pages:

src/pages/maintenance/assignments/MaintenanceAssignmentListPage.jsx
src/pages/maintenance/assignments/MaintenanceAssignmentFormPage.jsx

Routes:

/maintenance/assignments
/maintenance/assignments/new
/maintenance/assignments/:id/edit
/maintenance/assignments/:id/view

Landing page:
- Show filters
- Show assignment list DataGrid
- Add Assignment button

Filters:
- Site filter
- Request status filter
- Vendor filter
- Assignment status filter
- Search by request title/vendor/equipment/site

Add button:
- Navigate to /maintenance/assignments/new

Form behavior:
- Site first
- Then show related requests for selected site
- Then show vendors assigned to selected site

After save:
- Navigate back to /maintenance/assignments

DOWNTIME MODULE

Create/update pages:

src/pages/maintenance/downtime/DowntimeListPage.jsx
src/pages/maintenance/downtime/DowntimeFormPage.jsx

Routes:

/maintenance/downtime
/maintenance/downtime/new
/maintenance/downtime/:id/edit
/maintenance/downtime/:id/view

Landing page:
- Show filters
- Show downtime list DataGrid
- Add Downtime button

Filters:
- Site filter
- Equipment filter
- Request filter
- Date from
- Date to
- Search by equipment/request/site

Add button:
- Navigate to /maintenance/downtime/new

Form behavior:
- Site first
- Equipment filtered by selected site
- Request filtered by selected site/equipment
- Calculate downtime as existing logic

After save:
- Navigate back to /maintenance/downtime

COMMON UI RULES

Use same style as Vendor module:
- Page header
- Filter card
- DataGrid/list card
- Add button at top right
- Snackbar success/error
- Confirmation dialog before delete/inactive
- Loading state
- Empty state
- Responsive layout

PERMISSION RULES

Use existing frontend permission helpers if available.

Add button visible only if:
- REQUEST_CREATE for request
- ASSIGNMENT_CREATE for assignment
- DOWNTIME_CREATE for downtime

Edit button visible only if:
- REQUEST_UPDATE
- ASSIGNMENT_UPDATE
- DOWNTIME_UPDATE

Delete button visible only if:
- REQUEST_DELETE
- ASSIGNMENT_DELETE
- DOWNTIME_DELETE

View button visible if:
- REQUEST_VIEW
- ASSIGNMENT_VIEW
- DOWNTIME_VIEW

ROUTE UPDATE

Update App.jsx/routes:
- Sidebar menu should point to list routes only:
  Requests -> /maintenance/requests
  Assignments -> /maintenance/assignments
  Downtime -> /maintenance/downtime

Do not point sidebar directly to form pages.

SERVICE REQUIREMENT

Reuse existing services:
- maintenanceService.js
- assignmentService.js
- downtimeService.js
or existing project service names.

Do not create duplicate Axios config.
Do not hardcode API base URL.

If existing APIs already support list/create/update/getById/delete, reuse them.

If existing page has combined form/list logic:
- Split into ListPage and FormPage.
- Keep existing form validation and service calls.
- Move only UI flow, not backend logic.

IMPORTANT CODING RULES

1. Analyze Vendor page flow first.
2. Match Vendor page structure and style.
3. Do not change backend unless absolutely required.
4. Do not change database.
5. Do not change JWT/auth.
6. Do not remove site-first filtering logic.
7. Ensure frontend builds successfully.

After implementation, summarize:
- Pages created/modified
- Routes updated
- Sidebar routes updated
- Confirm backend was not changed