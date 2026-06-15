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

Implement Role Creation and Permission Assignment UI + Backend integration.

Current project already has:
- React Vite frontend
- Spring Boot backend
- PostgreSQL
- Existing login/JWT authentication
- Existing User table/service
- Employee module
- Role/Permission backend may already exist from previous task
- Existing sidebar with Operation / HR / Admin category
- Existing layered backend architecture:
  Controller
  Service
  DAO
  DTO
  Repository
  Entity

Requirement:
Create UI page where admin can:
1. Create new role
2. Edit role
3. View role
4. Delete/inactivate role
5. Assign permissions to role
6. Assign role to employee during employee creation/edit

IMPORTANT:
Analyze existing role/permission/user/employee implementation first.
Do not recreate duplicate tables or APIs if already available.
Do not break existing login/authentication.
All role and permission APIs must be protected.

DATABASE EXPECTED

Use existing tables if already created:

role_master
permission_master
role_permission
user_role

If not available, create them.

ROLE UI REQUIREMENT

Create pages:

src/pages/admin/roles/RoleListPage.jsx
src/pages/admin/roles/RoleFormPage.jsx
src/pages/admin/roles/RoleViewPage.jsx

Create service:

src/services/roleService.js
src/services/permissionService.js

Add routes:

/admin/roles
/admin/roles/new
/admin/roles/:id/edit
/admin/roles/:id/view

SIDEBAR REQUIREMENT

Under Admin category show:

Admin
  Roles

Show Admin category only if logged-in user has role/permission admin access.

Show Roles menu only if user has ROLE_VIEW or ADMIN permission.

ROLE LIST PAGE

Use Material UI DataGrid.

Columns:
- Role Code
- Role Name
- Description
- Status
- Permission Count
- Created At
- Actions

Actions:
- View
- Edit
- Delete/Inactivate

Filters:
- Search by role code / role name
- Status filter ACTIVE / INACTIVE

Buttons:
- Add Role button

Button visibility:
- Add Role visible only for ROLE_CREATE permission
- Edit visible only for ROLE_UPDATE permission
- Delete visible only for ROLE_DELETE permission
- View visible only for ROLE_VIEW permission

ROLE FORM PAGE

Sections:

Section 1: Role Details
Fields:
- Role Code
- Role Name
- Description
- Status ACTIVE / INACTIVE

Validation:
- Role Code required
- Role Code unique
- Role Name required
- Status required

Section 2: Permission Assignment

Show permission list grouped by module.

Example:

Dashboard
  [ ] DASHBOARD_VIEW

Site
  [ ] SITE_VIEW
  [ ] SITE_CREATE
  [ ] SITE_UPDATE
  [ ] SITE_DELETE

Employee
  [ ] EMPLOYEE_VIEW
  [ ] EMPLOYEE_CREATE
  [ ] EMPLOYEE_UPDATE
  [ ] EMPLOYEE_DELETE

Equipment
  [ ] EQUIPMENT_VIEW
  [ ] EQUIPMENT_CREATE
  [ ] EQUIPMENT_UPDATE
  [ ] EQUIPMENT_DELETE

Vendor
  [ ] VENDOR_VIEW
  [ ] VENDOR_CREATE
  [ ] VENDOR_UPDATE
  [ ] VENDOR_DELETE

Maintenance Request
  [ ] REQUEST_VIEW
  [ ] REQUEST_CREATE
  [ ] REQUEST_UPDATE
  [ ] REQUEST_DELETE

Maintenance Assignment
  [ ] ASSIGNMENT_VIEW
  [ ] ASSIGNMENT_CREATE
  [ ] ASSIGNMENT_UPDATE
  [ ] ASSIGNMENT_DELETE

Downtime
  [ ] DOWNTIME_VIEW
  [ ] DOWNTIME_CREATE
  [ ] DOWNTIME_UPDATE
  [ ] DOWNTIME_DELETE

Reports
  [ ] REPORT_VIEW

Permission UI requirements:
- Group permissions by moduleName
- Add Select All per module
- Add Clear All per module
- Add global Select All
- Search permission by permission code/name
- Show selected permission count
- Save selected permissions with role
- On edit, pre-select existing permissions

ROLE VIEW PAGE

Show:
- Role details
- Assigned permissions grouped by module
- Permission count

BACKEND API REQUIREMENTS

Create/update these APIs if missing:

Role APIs:
GET    /api/admin/roles
GET    /api/admin/roles/{id}
POST   /api/admin/roles
PUT    /api/admin/roles/{id}
DELETE /api/admin/roles/{id}

Permission APIs:
GET /api/admin/permissions
GET /api/admin/permissions/grouped

Role request DTO:

RoleDto {
  roleId
  roleCode
  roleName
  description
  status
  List<Long> permissionIds
  List<PermissionDto> permissions
}

PermissionDto {
  permissionId
  permissionCode
  permissionName
  moduleName
  actionName
  status
}

Backend logic:

Create Role:
1. Validate ROLE_CREATE permission.
2. Validate roleCode required.
3. Validate roleCode unique.
4. Validate roleName required.
5. Save role_master.
6. Save role_permission rows.
7. Use transaction.

Update Role:
1. Validate ROLE_UPDATE permission.
2. Validate role exists.
3. Validate roleCode unique except current role.
4. Update role_master.
5. Replace role_permission rows safely.
6. Use transaction.

Delete Role:
1. Validate ROLE_DELETE permission.
2. Do not physical delete if role is assigned to users.
3. Mark status INACTIVE.
4. Prevent deleting SUPER_ADMIN role.
5. Prevent current user's own active admin role from being removed if it will lock them out.

Get Role:
- Return role details and permissions.

Get Roles:
- Return permission count.

Get Permissions:
- Return all active permissions.

Get Permissions Grouped:
- Return permissions grouped by moduleName.

EMPLOYEE ROLE ASSIGNMENT REQUIREMENT

Update Employee Form.

In Employee creation/edit page:
Add Section: Role Assignment

Employee can have roles.

Since employee already has site assignments, role assignment should support:

Option A:
Assign global role:
- Role dropdown
- Applies to all assigned sites

Option B:
Assign site-specific role:
Editable grid:
- Site dropdown
- Role dropdown
- Status ACTIVE / INACTIVE
- Add Row
- Remove Row

Use this design:

Employee Basic Info
Employee Site Assignments
Login Details
Role Assignment

Role Assignment table columns:
- Site dropdown
- Role dropdown
- Status
- Remove

Rules:
- Site dropdown should show only employee assigned sites.
- Role dropdown should show active roles.
- Same employee/user cannot have duplicate ACTIVE role for same site.
- At least one role required if login is enabled.
- If login is not enabled, role assignment can be optional.
- If role site is blank/null, treat as global role if backend supports global role.
- Prefer site-specific roles for this project.

Update Employee create/update backend:
1. Save employee.
2. Save employee site assignments.
3. Create/update linked user login if enabled.
4. Save user_role mappings.
5. Validate selected roles exist and ACTIVE.
6. Validate role site is part of employee assigned sites.
7. Use transaction.

Update Employee get by id:
- Return roleAssignments.

EmployeeDto should include:

List<EmployeeRoleAssignmentDto> roleAssignments

EmployeeRoleAssignmentDto:
- userRoleId
- userId
- roleId
- roleCode
- roleName
- siteId
- siteCode
- siteName
- status

FRONTEND EMPLOYEE FORM

Update employeeService.js as needed.

Employee form should:
- Load active roles
- Load employee assigned sites
- Allow adding role rows
- Validate duplicate role/site rows
- Send roleAssignments with employee save/update payload
- On edit, pre-load assigned roles

SECURITY

Use existing JWT authentication.
Role APIs must be protected.

Required permission checks:
- ROLE_VIEW for list/view
- ROLE_CREATE for create
- ROLE_UPDATE for update
- ROLE_DELETE for delete
- PERMISSION_VIEW for permission list
- EMPLOYEE_UPDATE for assigning roles in employee form

If these permission codes do not exist, add seed records:
ROLE_VIEW
ROLE_CREATE
ROLE_UPDATE
ROLE_DELETE
PERMISSION_VIEW
USER_ROLE_ASSIGN

Frontend must hide menus/buttons based on permissions.
Backend must enforce permissions regardless of frontend.

IMPORTANT CODING RULES

1. Analyze existing role/permission/user/employee code first.
2. Reuse existing Axios instance.
3. Reuse existing response wrapper.
4. Do not hardcode API base URL.
5. Do not duplicate auth logic.
6. Do not break login.
7. Do not create duplicate role tables if already exists.
8. Ensure frontend builds.
9. Ensure backend compiles.

After implementation, summarize:
- Pages created
- Services created/updated
- Routes added
- APIs added/updated
- Employee form changes
- Tables/seeds added