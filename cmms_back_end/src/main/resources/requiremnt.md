Update Maintenance Assignment flow to be site-first.

Current issue:
In Maintenance Assignment page, all maintenance requests are loading first.
Required behavior:
User must select Site first, then only maintenance requests related to that selected site should be shown.

Current project already has:
- Site module
- site_master table
- Maintenance Request module with siteId
- Maintenance Assignment module
- Vendor site assignment
- JWT authentication
- Existing Axios setup
- React Vite frontend
- Spring Boot backend with Controller, Service, DAO, DTO, Repository, Entity pattern

IMPORTANT:
Analyze existing files first.
Do not recreate completed modules.
Do not duplicate APIs.
Do not break existing login/authentication.

FRONTEND REQUIREMENTS

Update MaintenanceAssignmentPage.

New form flow:

1. Site dropdown
2. Maintenance Request dropdown
3. Vendor dropdown
4. Assignment details

Behavior:

1. On page load:
   - Load active sites only.
   - Do not load all maintenance requests.
   - Request dropdown should be disabled until site is selected.
   - Vendor dropdown should be disabled until site/request is selected.

2. When Site is selected:
   - Clear selected request.
   - Clear selected vendor.
   - Fetch maintenance requests by selected siteId.
   - Fetch vendors assigned to selected siteId if current logic allows.
   - Request dropdown should show only requests where request.siteId = selected siteId.
   - Vendor dropdown should show only vendors assigned to selected site.

3. When Request is selected:
   - Validate request belongs to selected site.
   - If vendor loading depends on request site, use selected request.siteId.
   - Continue existing assignment flow.

4. If no requests found for selected site:
   - Show message: "No maintenance requests found for this site."
   - Keep request dropdown empty.

5. If no vendors found for selected site:
   - Show message: "No vendors assigned to this site."
   - Keep vendor dropdown empty.

6. On submit:
   - Send siteId along with requestId and vendorId if backend DTO supports it.
   - If backend does not need siteId in assignment table, still use it for validation.
   - Do not allow submit without siteId.
   - Do not allow submit without requestId.
   - Do not allow submit without vendorId.

Update maintenanceService.js or assignmentService.js:
- Add method to get requests by siteId.
- Add method to get vendors by siteId if not already available.
- Reuse existing Axios instance.
- Do not hardcode API base URL.

Example service methods:

getRequestsBySite(siteId)
getVendorsBySite(siteId)

BACKEND REQUIREMENTS

Update Maintenance Request API to support site filter if not already done:

GET /api/maintenance/requests?siteId=1

Behavior:
- If siteId is passed, return only requests for that site.
- If status filter already exists, support both:
  GET /api/maintenance/requests?siteId=1&status=OPEN

Update Maintenance Request Controller/Service/DAO/Repository:
- Accept optional siteId request param.
- Apply filter in query.
- Return siteId, siteName, equipmentId, equipmentName, request title/status.

Update Vendor API to support site filter if not already done:

GET /api/vendors?siteId=1

Behavior:
- Return only ACTIVE vendors assigned to selected site.
- Use vendor_site_assignment table.
- Do not return vendors not mapped to selected site.

Update Maintenance Assignment create/update backend validation:

When creating or updating assignment:
1. requestId is required.
2. vendorId is required.
3. siteId is required if DTO contains it.
4. Fetch maintenance request by requestId.
5. Get request.siteId.
6. If siteId is passed, validate siteId == request.siteId.
7. Check vendor_site_assignment has ACTIVE row for vendorId and request.siteId.
8. If vendor is not assigned to request site, reject with error:
   "Selected vendor is not assigned to the request site."
9. Save assignment only after validation.

If maintenance_assignment table does not have site_id:
- Do not add site_id unless existing design already uses it.
- Site can be derived from maintenance_request.
- But DTO may include siteId for validation/frontend flow.

If maintenance_assignment already has site_id:
- Save request.siteId into assignment.siteId.
- Do not trust frontend siteId blindly.

VALIDATION REQUIREMENTS

Frontend:
- Site is required.
- Request is required.
- Vendor is required.
- Request dropdown disabled until site selected.
- Vendor dropdown disabled until site selected.
- Clear dependent dropdowns when site changes.

Backend:
- Request must belong to selected site.
- Vendor must be mapped to selected site.
- Reject cross-site assignment.
- Keep JWT authentication enabled.

SECURITY REQUIREMENTS

Use existing JWT authentication.
All APIs must remain protected.
Do not change login flow.
Do not create new auth logic.

IMPORTANT CODING RULES

1. First analyze:
   - MaintenanceAssignmentPage
   - maintenanceService.js / assignmentService.js
   - vendorService.js
   - siteService.js
   - MaintenanceRequestController/Service/DAO/Repository
   - VendorController/Service/DAO/Repository
   - MaintenanceAssignmentController/Service/DAO/Repository

2. Then implement minimal required changes.

3. Do not recreate modules.

4. Do not rename working APIs unless necessary.

5. Do not load all requests on Maintenance Assignment page anymore.

6. Ensure frontend builds successfully.

7. Ensure backend compiles successfully.

After implementation, summarize:
- Files modified
- APIs updated
- Frontend behavior changed
- Backend validations added