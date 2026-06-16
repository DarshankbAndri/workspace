Implement configurable Approval Workflow for Preventive Maintenance and Maintenance Request flow.

Current project already has:
- React Vite frontend
- Spring Boot backend
- PostgreSQL
- Liquibase XML table-wise changelog structure
- JWT authentication
- Role and permission system
- Site-wise backend access filtering
- Site module
- Equipment module with siteId
- Vendor module with vendor_site_assignment
- Maintenance Request / Work Order module
- Preventive Maintenance module
- PM generated maintenance requests linked with pm_schedule_id and pm_due_date if already implemented

Requirement:
Implement Approval Workflow in such a way that approval process is configurable:
- Approval required = ON
- Approval required = OFF

When approval is OFF:
- Existing PM/request flow should work directly without approval.
- Request/work order can move to existing normal status directly.

When approval is ON:
- Selected actions should create approval request.
- Actual request/work order should remain pending until approved.
- Approver can approve or reject.
- Approval history should be tracked.

IMPORTANT:
Analyze existing PM and Maintenance Request code first.
Do not recreate completed modules.
Do not break existing request creation/assignment/downtime flow.
Do not break JWT/login.
Do not remove existing statuses unless needed.
Do not implement email/WhatsApp now.
Do not implement attachments now.

CONFIGURATION

Add backend property:

cmms.approval.enabled=true

Default should be false if safer for current system, or true only if explicitly enabled.

Also support module-level approval config table so admin can configure approval per process.

Create table:

approval_config
- config_id BIGSERIAL PRIMARY KEY
- module_code VARCHAR(100) NOT NULL
- action_code VARCHAR(100) NOT NULL
- approval_required BOOLEAN DEFAULT FALSE
- approver_role_code VARCHAR(100)
- min_approval_count INTEGER DEFAULT 1
- status VARCHAR(20) DEFAULT 'ACTIVE'
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP
- UNIQUE(module_code, action_code)

Initial module/action configs:
- PM_SCHEDULE / CREATE
- PM_SCHEDULE / UPDATE
- PM_WORK_ORDER / GENERATE
- MAINTENANCE_REQUEST / CREATE
- MAINTENANCE_REQUEST / CLOSE

Meaning:
If global cmms.approval.enabled=false:
- skip all approval logic.

If global cmms.approval.enabled=true:
- check approval_config.
- if approval_required=false for that module/action, skip approval.
- if approval_required=true, create approval request.

APPROVAL TABLES

Create:

approval_request
- approval_request_id BIGSERIAL PRIMARY KEY
- module_code VARCHAR(100) NOT NULL
- action_code VARCHAR(100) NOT NULL
- reference_id BIGINT
- reference_code VARCHAR(100)
- site_id BIGINT
- requested_by BIGINT
- requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- approval_status VARCHAR(30) DEFAULT 'PENDING'
- approver_role_code VARCHAR(100)
- min_approval_count INTEGER DEFAULT 1
- approved_count INTEGER DEFAULT 0
- rejected_count INTEGER DEFAULT 0
- remarks TEXT
- payload_json TEXT
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP

approval_action
- approval_action_id BIGSERIAL PRIMARY KEY
- approval_request_id BIGINT NOT NULL
- approver_user_id BIGINT NOT NULL
- action_status VARCHAR(30) NOT NULL
- comments TEXT
- action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- FOREIGN KEY approval_request_id REFERENCES approval_request(approval_request_id)

approval_status values:
- PENDING
- APPROVED
- REJECTED
- CANCELLED

action_status values:
- APPROVED
- REJECTED

Use actual existing user table FK if available.

LIQUIBASE

Create table-wise Liquibase XML files:
- approval_config.xml
- approval_request.xml
- approval_action.xml

Include indexes:
- approval_config(module_code, action_code)
- approval_request(module_code, action_code)
- approval_request(reference_id)
- approval_request(site_id)
- approval_request(approval_status)
- approval_action(approval_request_id)
- approval_action(approver_user_id)

BACKEND STRUCTURE

Follow existing architecture:
- Entity
- DTO
- Repository
- DAO
- Service
- Controller

Create:
- ApprovalConfig Entity/DTO/Repository/DAO/Service/Controller
- ApprovalRequest Entity/DTO/Repository/DAO/Service/Controller
- ApprovalAction Entity/DTO/Repository/DAO if required
- ApprovalWorkflowService

ApprovalWorkflowService methods:
- isApprovalEnabled(moduleCode, actionCode)
- createApprovalRequest(moduleCode, actionCode, referenceId, referenceCode, siteId, payload, remarks)
- approve(approvalRequestId, comments)
- reject(approvalRequestId, comments)
- getPendingApprovalsForCurrentUser()
- getApprovalHistory(moduleCode, referenceId)
- validateApproverPermission(approvalRequest)

PERMISSION CODES

Add permissions if missing:
- APPROVAL_VIEW
- APPROVAL_APPROVE
- APPROVAL_REJECT
- APPROVAL_CONFIG_VIEW
- APPROVAL_CONFIG_UPDATE

Backend must enforce permissions.

APPROVAL CONFIG API

Create APIs:

GET /api/admin/approval-config
PUT /api/admin/approval-config/{id}

Optional:
POST /api/admin/approval-config

Only admin users can update approval config.

APPROVAL API

GET /api/approvals/pending
GET /api/approvals/history?moduleCode=&referenceId=
POST /api/approvals/{approvalRequestId}/approve
POST /api/approvals/{approvalRequestId}/reject

Request body for approve/reject:
{
  "comments": "Approved"
}

APPROVER LOGIC

Approver can approve if:
- User has APPROVAL_APPROVE permission for approve
- User has APPROVAL_REJECT permission for reject
- User has role matching approver_role_code from approval_request OR is ADMIN/SUPER_ADMIN
- User has access to approval_request.site_id based on existing site access logic

Prevent:
- Same user approving same approval_request multiple times
- Request creator approving own request if avoid_self_approval config is needed. If not needed now, skip.

MAINTENANCE REQUEST / PM INTEGRATION

Integrate approval workflow into:

1. PM Schedule Create/Update
2. PM Work Order Generate
3. Maintenance Request Create
4. Maintenance Request Close

Behavior example:

Maintenance Request Create:
- If approval not required:
  - Save request normally with status OPEN or existing default.
- If approval required:
  - Save request with status PENDING_APPROVAL or DRAFT_PENDING_APPROVAL.
  - Create approval_request with moduleCode=MAINTENANCE_REQUEST, actionCode=CREATE.
  - Return response saying approval pending.

When approved:
- Update maintenance request status from PENDING_APPROVAL to OPEN.
- Mark approval_request APPROVED.

When rejected:
- Update maintenance request status to REJECTED or keep existing request as REJECTED.
- Mark approval_request REJECTED.

Maintenance Request Close:
- If approval not required:
  - close normally.
- If approval required:
  - keep status CLOSE_PENDING_APPROVAL.
  - create approval request.
- On approval:
  - change status to CLOSED/COMPLETED.
- On reject:
  - return to previous status or IN_PROGRESS.

PM Work Order Generate:
- If approval not required:
  - generate work orders normally.
- If approval required:
  - create approval request for generation.
  - Do not generate work order until approved.
  - Store generation parameters in payload_json.
- On approval:
  - generate work orders using payload_json.
  - apply duplicate prevention.
- On reject:
  - do not generate.

PM Schedule Create/Update:
- If approval not required:
  - save normally.
- If approval required:
  - Option A preferred: save as PENDING_APPROVAL.
  - On approval, activate schedule.
  - On reject, mark REJECTED.
- Keep implementation simple and safe.

STATUS ADDITIONS

Use existing status fields if available.

Add/support statuses:
- PENDING_APPROVAL
- APPROVED
- REJECTED
- CLOSE_PENDING_APPROVAL

Do not break existing statuses.

FRONTEND REQUIREMENTS

Create pages:

src/pages/approvals/ApprovalInboxPage.jsx
src/pages/approvals/ApprovalHistoryPage.jsx
src/pages/admin/approvalConfig/ApprovalConfigPage.jsx

Services:
src/services/approvalService.js
src/services/approvalConfigService.js

Sidebar:
Add under Admin or Operation depending on existing layout:

Operation:
  Approvals
    Pending Approvals
    Approval History

Admin:
  Approval Config

Show menus based on permissions:
- APPROVAL_VIEW
- APPROVAL_CONFIG_VIEW

Approval Inbox UI:
- DataGrid
- Filters:
  - Module
  - Action
  - Site
  - Status
  - Requested From/To
- Columns:
  - Module
  - Action
  - Reference Code
  - Site
  - Requested By
  - Requested At
  - Status
  - Actions
- Actions:
  - View
  - Approve
  - Reject

Approve/Reject:
- Open dialog
- Comments textbox
- Submit

Approval History:
- Show approval actions and comments.

Approval Config UI:
- List module/action configs
- Toggle approval_required ON/OFF
- Select approver role
- Min approval count
- Status

Form/page integration:
- In Maintenance Request/PM pages, if saved item is pending approval, show status badge "Pending Approval".
- Do not allow assignment/downtime for request until it is approved/open.

SECURITY AND SITE FILTERING

Use existing JWT.
Use existing role/permission checks.
Use existing site access filtering.

Backend must enforce:
- User can only view/approve approvals for assigned sites.
- Admin/Super admin can view all if existing rules allow.
- Frontend hiding is not enough.

IMPORTANT CODING RULES

1. Analyze existing request and PM status flow first.
2. Keep global config cmms.approval.enabled.
3. Keep module-level approval_config table.
4. Do not implement notifications now.
5. Do not implement attachments now.
6. Do not break existing workflow when approval is disabled.
7. Use transactions when approval changes business record status.
8. Store enough payload_json for deferred PM generation.
9. Use table-wise Liquibase XML.
10. Ensure frontend builds.
11. Ensure backend compiles.

After implementation, summarize:
- Tables added
- Liquibase XML files added
- APIs added
- Backend modules changed
- Frontend pages added
- How approval behaves when enabled
- How approval behaves when disable