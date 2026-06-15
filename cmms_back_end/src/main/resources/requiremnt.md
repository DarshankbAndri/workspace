Before implementing this task, use Graphify/project graph first.

Find related files and existing patterns for:
- frontend page
- route
- sidebar
- service
- backend controller
- service
- DAO
- repository
- entity
- DTO
- authentication/security
- database table

Then implement using the existing project pattern.
Do not duplicate files or APIs.

Implement Role, Permission, and Site-based access control for CMMS.

Current project already has:
- React Vite frontend
- Spring Boot backend
- PostgreSQL
- Existing User table
- Existing login API
- Existing JWT authentication
- Employee module
- Site module
- Employee site assignment
- Operation modules:
  Dashboard
  Equipment
  Vendors
  Maintenance Requests
  Maintenance Assignments
  Downtime
  Reports

IMPORTANT:
All filtering and permission enforcement must happen in backend.
Frontend can hide/show UI, but backend must be the final security layer.

Do not break existing login.
Do not create a second authentication system.
Reuse existing JWT/security setup.
Analyze existing User, Employee, Site, and Auth code first.

GOAL

Each logged-in user should access only:
1. Menus allowed by their role/permissions.
2. Sites assigned to that employee/user.
3. Data belonging to their allowed sites.

Example:
Employee A assigned to Site 1 and Site 2.
When Employee A logs in:
- Site dropdown should show only Site 1 and Site 2.
- Equipment list should show only equipment from Site 1 and Site 2.
- Requests should show only those sites.
- Downtime should show only those sites.
- Dashboard should calculate only those sites.
- User cannot access other site data even by changing API URL manually.

DATABASE DESIGN

Create/modify tables as needed.

Required permission model:

role_master
- role_id BIGSERIAL PRIMARY KEY
- role_code VARCHAR(50) UNIQUE NOT NULL
- role_name VARCHAR(100) NOT NULL
- description TEXT
- status VARCHAR(20) DEFAULT 'ACTIVE'
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP

permission_master
- permission_id BIGSERIAL PRIMARY KEY
- permission_code VARCHAR(100) UNIQUE NOT NULL
- permission_name VARCHAR(150) NOT NULL
- module_name VARCHAR(100)
- action_name VARCHAR(50)
- status VARCHAR(20) DEFAULT 'ACTIVE'
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP

role_permission
- role_permission_id BIGSERIAL PRIMARY KEY
- role_id BIGINT NOT NULL
- permission_id BIGINT NOT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- FOREIGN KEY role_id REFERENCES role_master(role_id)
- FOREIGN KEY permission_id REFERENCES permission_master(permission_id)
- UNIQUE(role_id, permission_id)

user_role
- user_role_id BIGSERIAL PRIMARY KEY
- user_id BIGINT NOT NULL
- role_id BIGINT NOT NULL
- site_id BIGINT NULL
- status VARCHAR(20) DEFAULT 'ACTIVE'
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP
- FOREIGN KEY role_id REFERENCES role_master(role_id)
- FOREIGN KEY site_id REFERENCES site_master(site_id)

If existing user table has different primary key/column names, adapt to existing naming.

Meaning:
- User can have multiple roles.
- Role can be global if site_id is NULL.
- Role can be site-specific if site_id is present.

SEED DEFAULT ROLES

Create default roles:

SUPER_ADMIN
ADMIN
HR_ADMIN
SITE_MANAGER
MAINTENANCE_MANAGER
TECHNICIAN
VIEWER

SEED DEFAULT PERMISSIONS

Use permission codes:

DASHBOARD_VIEW

SITE_VIEW
SITE_CREATE
SITE_UPDATE
SITE_DELETE

EMPLOYEE_VIEW
EMPLOYEE_CREATE
EMPLOYEE_UPDATE
EMPLOYEE_DELETE

EQUIPMENT_VIEW
EQUIPMENT_CREATE
EQUIPMENT_UPDATE
EQUIPMENT_DELETE

VENDOR_VIEW
VENDOR_CREATE
VENDOR_UPDATE
VENDOR_DELETE

REQUEST_VIEW
REQUEST_CREATE
REQUEST_UPDATE
REQUEST_DELETE

ASSIGNMENT_VIEW
ASSIGNMENT_CREATE
ASSIGNMENT_UPDATE
ASSIGNMENT_DELETE

DOWNTIME_VIEW
DOWNTIME_CREATE
DOWNTIME_UPDATE
DOWNTIME_DELETE

REPORT_VIEW

Default mapping:
- SUPER_ADMIN: all permissions, all sites
- ADMIN: all operation permissions, all sites
- HR_ADMIN: site and employee permissions
- SITE_MANAGER: view/create/update operation data for assigned sites
- MAINTENANCE_MANAGER: requests, assignments, downtime for assigned sites
- TECHNICIAN: request view/update and downtime create/view for assigned sites
- VIEWER: view only for assigned sites

BACKEND REQUIREMENTS

Create backend modules:

Role:
- Entity
- DTO
- Repository
- DAO if project uses DAO
- Service
- Controller

Permission:
- Entity
- DTO
- Repository
- DAO if project uses DAO
- Service
- Controller

UserRole:
- Entity
- DTO
- Repository
- DAO if project uses DAO
- Service

AccessControlService:
Create a central service for permission and site filtering.

Methods required:
- getCurrentUser()
- getCurrentUserId()
- getCurrentEmployeeId()
- getAllowedSiteIds()
- hasPermission(permissionCode)
- hasAnyPermission(permissionCodes)
- validatePermission(permissionCode)
- validateSiteAccess(siteId)
- validateAnySiteAccess(Collection<Long> siteIds)
- isSuperAdmin()
- isAdmin()

All business modules must call this service.

JWT REQUIREMENT

Update login response to include:
- token
- user info
- roles
- permissions
- allowedSites

Example response:

{
  "token": "...",
  "user": {
    "userId": 1,
    "username": "admin",
    "employeeId": 10,
    "employeeName": "Ramesh"
  },
  "roles": ["SITE_MANAGER"],
  "permissions": ["DASHBOARD_VIEW", "EQUIPMENT_VIEW"],
  "allowedSites": [
    { "siteId": 1, "siteCode": "BLR", "siteName": "Bangalore Plant" }
  ]
}

Do not put huge permissions inside JWT unless existing system already does it.
It is okay to return permissions in login response and also validate from DB in backend.

SITE FILTERING RULE

Backend must apply site filtering automatically.

For all list APIs:
- If user is SUPER_ADMIN or ADMIN, allow all sites unless siteId filter is passed.
- If normal user, restrict to assigned siteIds only.
- If siteId query param is passed, validate it is inside allowedSiteIds.
- If siteId is not passed, return data only for allowedSiteIds.

Apply this to:

GET /api/hr/sites
GET /api/hr/employees
GET /api/equipment
GET /api/vendors
GET /api/maintenance/requests
GET /api/maintenance/assignments
GET /api/maintenance/downtime
GET /api/cmms/dashboard/**
GET /api/reports/** if exists

CREATE/UPDATE RULE

For create/update APIs:
- Validate required permission.
- Validate selected siteId belongs to current user's allowed sites.
- Reject cross-site access.

Examples:
- Equipment create: EQUIPMENT_CREATE + site access
- Request create: REQUEST_CREATE + site access
- Assignment create: ASSIGNMENT_CREATE + request site access + vendor mapped to site
- Downtime create: DOWNTIME_CREATE + equipment/request site access
- Vendor assignment to site: VENDOR_UPDATE + site access
- Employee site assignment: EMPLOYEE_UPDATE + site access

DELETE RULE

Delete/inactive APIs:
- Validate DELETE permission.
- Validate record site access where applicable.
- Prefer status inactive instead of physical delete if existing pattern uses that.

API ENDPOINTS

Add:

GET /api/auth/me
Returns current user, roles, permissions, allowedSites.

Role APIs:
GET /api/admin/roles
GET /api/admin/roles/{id}
POST /api/admin/roles
PUT /api/admin/roles/{id}
DELETE /api/admin/roles/{id}

Permission APIs:
GET /api/admin/permissions
GET /api/admin/permissions/grouped

User Role APIs:
GET /api/admin/users/{userId}/roles
PUT /api/admin/users/{userId}/roles

All admin APIs require ADMIN or SUPER_ADMIN permission.

FRONTEND REQUIREMENTS

Update auth store/context.

Store after login:
- token
- user
- roles
- permissions
- allowedSites

Create helpers:
- hasPermission(permissionCode)
- hasAnyPermission(permissionCodes)
- getAllowedSites()
- isAdmin()
- isSuperAdmin()

SIDEBAR PERMISSION RULE

Show menus only if user has permission.

Operation:
Dashboard -> DASHBOARD_VIEW
Equipment -> EQUIPMENT_VIEW
Vendors -> VENDOR_VIEW
Requests -> REQUEST_VIEW
Assignments -> ASSIGNMENT_VIEW
Downtime -> DOWNTIME_VIEW
Reports -> REPORT_VIEW

HR:
Sites -> SITE_VIEW
Employees -> EMPLOYEE_VIEW

Admin:
Roles -> role management permission
Permissions -> permission management permission
User Roles -> user role management permission

SITE DROPDOWN RULE

All site dropdowns must use allowedSites from /api/auth/me or login response.

Do not call all-sites API for normal users.

For normal users:
- Show only assigned sites.
- If only one site is assigned, auto-select that site.
- If multiple sites assigned, user can select from assigned sites only.

For ADMIN/SUPER_ADMIN:
- Allow All Sites option in dashboard/list filters.
- Allow selecting any active site.

Apply site dropdown rules in:
- Dashboard
- Equipment list/form
- Vendor list/form
- Request list/form
- Assignment page
- Downtime list/form
- Reports
- Employee site assignment

FRONTEND BUTTON PERMISSION RULE

Hide or disable buttons based on permission:

Create buttons:
- EQUIPMENT_CREATE
- VENDOR_CREATE
- REQUEST_CREATE
- ASSIGNMENT_CREATE
- DOWNTIME_CREATE
- SITE_CREATE
- EMPLOYEE_CREATE

Edit buttons:
- *_UPDATE

Delete buttons:
- *_DELETE

If user has only VIEW permission:
- show list/detail only
- hide create/edit/delete

ROUTE PROTECTION

Add protected route wrapper:
- Requires authentication
- Requires permission

Example:
<Route path="/equipment" element={
  <ProtectedRoute permission="EQUIPMENT_VIEW">
    <EquipmentListPage />
  </ProtectedRoute>
} />

If no permission:
- show Access Denied page
- do not redirect silently

BACKEND VALIDATION EXAMPLES

Equipment list:
- get allowedSiteIds from AccessControlService
- if siteId passed, validate site access
- query equipment where site_id in allowedSiteIds or site_id = siteId

Equipment create:
- validatePermission("EQUIPMENT_CREATE")
- validateSiteAccess(dto.siteId)

Request create:
- validatePermission("REQUEST_CREATE")
- validateSiteAccess(dto.siteId)
- validate equipment belongs to dto.siteId

Assignment create:
- validatePermission("ASSIGNMENT_CREATE")
- fetch request
- validateSiteAccess(request.siteId)
- validate vendor assigned to request.siteId

Downtime create:
- validatePermission("DOWNTIME_CREATE")
- validateSiteAccess(dto.siteId)
- validate equipment/request belongs to dto.siteId

Dashboard:
- validate DASHBOARD_VIEW
- restrict all queries to allowed site ids

REPORTS:
- validate REPORT_VIEW
- restrict all report data to allowed site ids

UI PAGES TO CREATE

Admin pages if not existing:

src/pages/admin/roles/RoleListPage.jsx
src/pages/admin/roles/RoleFormPage.jsx

src/pages/admin/userRoles/UserRoleAssignmentPage.jsx

Services:
src/services/authService.js update
src/services/roleService.js
src/services/permissionService.js
src/services/userRoleService.js

Add Admin category/menu only if user has admin permissions:

Admin
  Roles
  User Roles
  Permissions

DATABASE MIGRATION

Generate PostgreSQL DDL or Liquibase migration based on existing project style.

Also seed default roles and permissions.

IMPORTANT CODING RULES

1. Analyze existing auth code first.
2. Do not break existing login.
3. Do not duplicate user table.
4. Reuse existing User entity/service.
5. Add employee_id/user_id link only if needed.
6. Backend must enforce all permissions and site filters.
7. Frontend is only for user experience.
8. Do not trust siteId from frontend without validation.
9. Do not return unauthorized data from backend.
10. Reuse existing response wrapper.
11. Reuse existing Axios instance.
12. Ensure frontend builds.
13. Ensure backend compiles.

After implementation, summarize:
- Tables added/modified
- APIs added
- Backend services created
- Existing modules updated with site filtering
- Frontend pages updated
- Permission rules added