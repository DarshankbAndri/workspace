Analyze the existing project structure before changing anything.

Current project already has:
- React Vite frontend
- Spring Boot backend
- PostgreSQL
- CMMS modules completed
- Sidebar navigation completed
- Dashboard completed
- Backend layered architecture:
  Controller
  Service
  DAO
  DTO
  Repository
  Entity

Now implement Site-wise Organization and HR module.

IMPORTANT:
Do not recreate existing CMMS files.
Do not duplicate existing routes.
Do not break existing Dashboard, Equipment, Vendor, Maintenance, Reports pages.
Reuse existing design, Axios setup, route pattern, service pattern, backend package structure, response format, and error handling.

NEW REQUIREMENT

Single organization can have multiple sites.

Example:
Organization A
  - Site 1
  - Site 2
  - Site 3

Employees/users can work in multiple sites.
For each site, employee can have same or different role.

Example:
Employee: Ramesh
  Site: Bangalore Plant, Role: Site Engineer
  Site: Mysore Plant, Role: Maintenance Manager

Employee basic information should be created once.
Site-role assignment should be multiple rows per employee.

FRONTEND REQUIREMENTS

Create pages:

src/pages/hr/site/SiteListPage.jsx
src/pages/hr/site/SiteFormPage.jsx

src/pages/hr/employee/EmployeeListPage.jsx
src/pages/hr/employee/EmployeeFormPage.jsx

Create services:

src/services/siteService.js
src/services/employeeService.js

SITE PAGE REQUIREMENTS

Site List Page:
- Material UI DataGrid
- Search by site name, site code, city
- Add Site button
- Edit button
- View button
- Delete or inactive button
- Status filter ACTIVE / INACTIVE
- Responsive layout

Site Form Fields:
- Site Code
- Site Name
- Organization Name
- Site Type
- Address Line 1
- Address Line 2
- City
- State
- Country
- Pincode
- Contact Person
- Contact Mobile
- Contact Email
- Latitude
- Longitude
- Status ACTIVE / INACTIVE

EMPLOYEE PAGE REQUIREMENTS

Employee List Page:
- Material UI DataGrid
- Search by employee name, employee code, mobile, email
- Add Employee button
- Edit button
- View button
- Status filter ACTIVE / INACTIVE
- Show assigned site count
- Responsive layout

Employee Form should have two sections:

Section 1: Basic Information
- Employee Code
- First Name
- Last Name
- Mobile Number
- Email
- Gender
- Date of Birth
- Date of Joining
- Designation
- Department
- Status ACTIVE / INACTIVE

Section 2: Site Execution Details

Employee can be assigned to multiple sites.

Use editable table/grid with rows:

- Site dropdown
- Role dropdown or role text
- Is Primary Site checkbox
- Effective From Date
- Effective To Date
- Status ACTIVE / INACTIVE
- Add Row button
- Remove Row button

Validation:
- Employee Code is required and unique
- Mobile number is required
- Email should be valid
- At least one site assignment is required
- Only one primary site allowed per employee
- Same employee cannot have duplicate ACTIVE assignment for same site and role
- Effective To Date should not be before Effective From Date

BACKEND REQUIREMENTS

Create backend implementation using existing architecture:

Entity
DTO
DAO
Repository
Service
Controller

Create for:

1. Site
2. Employee
3. EmployeeSiteAssignment

DATABASE TABLES

Generate PostgreSQL DDL scripts.

Tables:

site_master
employee_master
employee_site_assignment

DDL REQUIREMENTS

site_master:
- site_id BIGSERIAL PRIMARY KEY
- site_code VARCHAR(50) UNIQUE NOT NULL
- site_name VARCHAR(200) NOT NULL
- organization_name VARCHAR(200)
- site_type VARCHAR(100)
- address_line1 VARCHAR(300)
- address_line2 VARCHAR(300)
- city VARCHAR(100)
- state VARCHAR(100)
- country VARCHAR(100)
- pincode VARCHAR(20)
- contact_person VARCHAR(100)
- contact_mobile VARCHAR(20)
- contact_email VARCHAR(150)
- latitude NUMERIC(12,8)
- longitude NUMERIC(12,8)
- status VARCHAR(20)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP

employee_master:
- employee_id BIGSERIAL PRIMARY KEY
- employee_code VARCHAR(50) UNIQUE NOT NULL
- first_name VARCHAR(100) NOT NULL
- last_name VARCHAR(100)
- mobile_number VARCHAR(20) NOT NULL
- email VARCHAR(150)
- gender VARCHAR(20)
- date_of_birth DATE
- date_of_joining DATE
- designation VARCHAR(100)
- department VARCHAR(100)
- status VARCHAR(20)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP

employee_site_assignment:
- assignment_id BIGSERIAL PRIMARY KEY
- employee_id BIGINT NOT NULL
- site_id BIGINT NOT NULL
- role_name VARCHAR(100) NOT NULL
- is_primary_site BOOLEAN DEFAULT FALSE
- effective_from DATE
- effective_to DATE
- status VARCHAR(20)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP
- FOREIGN KEY employee_id REFERENCES employee_master(employee_id)
- FOREIGN KEY site_id REFERENCES site_master(site_id)

Add useful indexes:
- site_master(site_code)
- site_master(status)
- employee_master(employee_code)
- employee_master(status)
- employee_site_assignment(employee_id)
- employee_site_assignment(site_id)
- employee_site_assignment(status)

BACKEND API REQUIREMENTS

Site APIs:

GET    /api/hr/sites
GET    /api/hr/sites/{id}
POST   /api/hr/sites
PUT    /api/hr/sites/{id}
DELETE /api/hr/sites/{id}

Employee APIs:

GET    /api/hr/employees
GET    /api/hr/employees/{id}
POST   /api/hr/employees
PUT    /api/hr/employees/{id}
DELETE /api/hr/employees/{id}

Employee Site Assignment APIs can be handled inside Employee create/update.

When creating employee:
- Save employee basic info
- Save multiple site assignments

When updating employee:
- Update employee basic info
- Replace or update site assignments safely
- Do not leave duplicate active assignments

DTO REQUIREMENTS

SiteDto

EmployeeDto should contain:

employee basic fields
List<EmployeeSiteAssignmentDto> siteAssignments

EmployeeSiteAssignmentDto:
- assignmentId
- siteId
- siteName
- roleName
- isPrimarySite
- effectiveFrom
- effectiveTo
- status

DAO REQUIREMENTS

SiteDao:
- save
- update
- delete or mark inactive
- getById
- getAll

EmployeeDao:
- save employee with assignments using transaction
- update employee with assignments using transaction
- delete or mark inactive
- getById with assignments
- getAll with assigned site count

SERVICE REQUIREMENTS

Use validation in service layer:

Site:
- siteCode required
- siteName required
- duplicate siteCode not allowed

Employee:
- employeeCode required
- duplicate employeeCode not allowed
- mobileNumber required
- at least one site assignment required
- only one primary site allowed
- validate site exists
- prevent duplicate active site-role assignment
- effectiveTo >= effectiveFrom

CONTROLLER REQUIREMENTS

Return proper HTTP response.
Use existing project response wrapper if available.
Follow existing controller pattern.

FRONTEND ROUTES

Add routes:

/hr/sites
/hr/sites/new
/hr/sites/:id/edit
/hr/employees
/hr/employees/new
/hr/employees/:id/edit

Update sidebar category selection:

Operation:
existing routes

HR:
/hr/sites
/hr/employees

UI DESIGN REQUIREMENTS

- Same theme as existing CMMS
- Professional enterprise look
- Material UI Card layout
- Responsive forms
- Proper loading indicator
- Snackbar success/error messages
- Confirmation dialog before delete/inactive
- Use existing reusable components if available

IMPORTANT CODING RULES

1. First analyze current files:
   - App.jsx
   - Sidebar component
   - Existing services
   - Existing backend package structure
   - Existing controller/service/dao/repository pattern

2. Then implement new files.

3. Do not rename existing working files.

4. Do not remove existing menus.

5. Do not hardcode API base URL if Axios instance already exists.

6. Do not create duplicate Axios config.

7. Do not create placeholder code.

8. Ensure frontend builds successfully.

9. Ensure backend compiles successfully.

10. After completion, summarize only:
   - Files created
   - Files modified
   - APIs added
   - Tables added