# CMMS Production New Requirements

Date: 2026-06-25

## Purpose

This document lists new production-level requirements for the CMMS application. It is intentionally separate from the improvement report:

- The improvement report focuses on what should be fixed in the current system.
- This requirements document defines what the production product should support next.

## Product Goal

Build a reliable, secure, multi-site CMMS platform for plant maintenance teams to manage assets, work requests, preventive maintenance, downtime, spare parts, approvals, notifications, reports, and operational compliance.

## Requirement Priorities

- P0: Required before production go-live or pilot with real users.
- P1: Required for a stable production rollout.
- P2: Required for scale, maturity, and enterprise adoption.
- P3: Strategic enhancements.

## P0 Production Foundation Requirements

### REQ-P0-001: Environment-based configuration

Requirement:

- The backend and frontend must support separate `dev`, `test`, `staging`, and `prod` configurations.
- Production secrets must not be stored in source code.
- Production startup must fail when required secrets are missing.

Acceptance criteria:

- Database URL, database credentials, JWT secret, CORS origins, file storage path, SMTP settings, and feature flags are all environment-driven.
- `application-prod.properties` contains no real secrets.
- Production deployment documentation lists every required environment variable.

### REQ-P0-002: Enforced backend RBAC

Requirement:

- Backend APIs must enforce role and permission checks regardless of frontend route visibility.
- Permission checks must fail closed.

Acceptance criteria:

- `cmms.security.api-permission-restriction-enabled=true` in production.
- Non-admin users with no site assignment see no site data.
- API tests prove forbidden users receive 403 responses for protected actions.
- Admin, maintenance manager, technician, store, HR, and super admin roles are tested.

### REQ-P0-003: Production authentication controls

Requirement:

- Authentication must support secure token lifecycle, lockout, and password policy.

Acceptance criteria:

- Login has rate limiting and account lockout after configurable failed attempts.
- Password policy includes minimum length, complexity, and reuse prevention.
- Password change invalidates existing sessions.
- User deactivation invalidates active sessions.
- Token expiration and refresh behavior are documented.

### REQ-P0-004: CI/CD quality gates

Requirement:

- Every merge to production branches must pass automated checks.

Acceptance criteria:

- Backend tests run in CI.
- Frontend tests and build run in CI.
- Liquibase validates and migrates an empty PostgreSQL database in CI.
- Dependency scan, secret scan, and static analysis run in CI.
- Build artifacts include version, commit hash, and build time.

### REQ-P0-005: Production health and observability

Requirement:

- The system must expose operational health and diagnostic signals.

Acceptance criteria:

- Backend exposes liveness and readiness endpoints.
- Logs include correlation id, user id when authenticated, HTTP method, path, status, duration, and error code.
- Unexpected exceptions are logged once with stack trace and correlation id.
- Metrics exist for API latency, error rates, login failures, notification job status, PM generation, approval queues, and stock-out alerts.

Implementation status:

- Added Spring Boot Actuator and Prometheus metrics.
- Public health endpoints:
  - `GET /api/actuator/health`
  - `GET /api/actuator/health/liveness`
  - `GET /api/actuator/health/readiness`
- Authenticated diagnostic endpoints:
  - `GET /api/actuator/metrics`
  - `GET /api/actuator/prometheus`
- Correlation ID:
  - Request header: `X-Correlation-Id`
  - Response header: `X-Correlation-Id`
  - MDC key: `correlationId`
- Request summary logs include `correlationId`, `userId`, HTTP method, path, status, durationMs, and errorCode.
- Standard metrics:
  - `cmms.api.requests`
  - `cmms.api.errors`
  - `cmms.auth.login.failures`
  - `cmms.notification.job.runs`
  - `cmms.notification.job.failures`
  - `cmms.notification.job.last_success_timestamp`
  - `cmms.notification.job.last_failure_timestamp`
  - `cmms.pm.generation.runs`
  - `cmms.pm.generation.generated_work_orders`
  - `cmms.pm.generation.failures`
  - `cmms.pm.generation.duration`
  - `cmms.approval.pending.count`
  - `cmms.approval.overdue.count`
  - `cmms.inventory.stockout.count`
  - `cmms.inventory.low_stock.count`
  - `cmms.inventory.stockout.alerts`
- Metric tags avoid raw usernames, emails, entity ids, and unbounded free-form values.

### REQ-P0-006: Database migration runbook

Requirement:

- Database migrations must be repeatable, auditable, and tested before release.

Acceptance criteria:

- Liquibase can build the schema from an empty PostgreSQL database.
- Liquibase can upgrade from the previous release database.
- Rollback or recovery steps are documented for each release.
- Demo data is not loaded automatically in production.

### REQ-P0-007: Current CMMS documentation set

Requirement:

- Production handover must include accurate CMMS documentation.

Acceptance criteria:

- Architecture document describes current modules and data flow.
- API document is generated or aligned with OpenAPI.
- Deployment runbook describes backend, frontend, DB, env vars, and reverse proxy.
- Admin guide describes roles, permissions, sites, and user provisioning.
- Legacy travel reimbursement and claims references are removed or archived.

## P1 Core CMMS Functional Requirements

### REQ-P1-001: Asset hierarchy

Requirement:

- Equipment must support a real asset hierarchy, not only a flat equipment list.

Acceptance criteria:

- Sites can contain areas, lines, systems, equipment, and components.
- Equipment can have parent/child relationships.
- Users can filter work orders and reports by any hierarchy level.
- Equipment has criticality, status, manufacturer, model, serial number, installation date, warranty, and responsible team.

### REQ-P1-002: QR/barcode asset access

Requirement:

- Technicians must be able to open equipment records by QR or barcode scan.

Acceptance criteria:

- Each equipment record has a unique QR/barcode value.
- Frontend can display and print QR labels.
- Scanning opens equipment detail, active work orders, history, and spare parts.
- Permission checks still apply after scanning.

### REQ-P1-003: Work order lifecycle

Requirement:

- Maintenance requests must mature into a complete work order lifecycle.

Required states:

- Draft
- Submitted
- Pending approval
- Open
- Planned
- Assigned
- In progress
- Waiting for spare
- Waiting for vendor
- Completed
- Closure pending approval
- Closed
- Rejected
- Cancelled

Acceptance criteria:

- Allowed state transitions are centrally defined.
- Each transition can capture remarks, actor, timestamp, and optional attachment.
- Closure requires resolution summary, work performed, failure code, root cause, downtime impact, and actual cost where applicable.

### REQ-P1-004: Maintenance checklist templates

Requirement:

- PM and corrective work orders must support checklist templates.

Acceptance criteria:

- Admins can create checklist templates by equipment type or PM schedule.
- Checklist items support text, number, pass/fail, date, photo, and signature response types.
- Work orders snapshot the checklist version used at creation time.
- Completion can require all mandatory checklist items.

### REQ-P1-005: Preventive maintenance recurrence engine

Requirement:

- Preventive maintenance must support production-grade scheduling.

Acceptance criteria:

- PM schedules support daily, weekly, monthly, quarterly, yearly, custom interval, and calendar-based recurrence.
- Schedules support lead days, due date, grace period, estimated duration, priority, assigned team, vendor, and checklist.
- Users can skip, defer, or advance a PM with approval and reason.
- PM generation is idempotent and protected against duplicate jobs in multi-instance deployment.

### REQ-P1-006: Meter-based preventive maintenance

Requirement:

- PM schedules must support meter or runtime triggers.

Acceptance criteria:

- Equipment can define meters such as run hours, cycles, distance, or production count.
- Users can enter meter readings manually or through integration.
- PM work orders are generated when thresholds are reached.
- Reports show overdue meter readings and forecasted PM due dates.

### REQ-P1-007: Downtime and failure analysis

Requirement:

- Downtime tracking must support reliability analysis.

Acceptance criteria:

- Downtime records capture planned/unplanned, start, end, reason, failure mode, cause, corrective action, equipment, site, and related work order.
- Reports calculate MTBF, MTTR, downtime hours, downtime cost, and top failure causes.
- Users can run Pareto analysis by equipment, site, cause, and date range.

### REQ-P1-008: Spare parts inventory controls

Requirement:

- Spare parts inventory must support real store operations.

Acceptance criteria:

- Each spare part supports part code, name, category, unit, preferred vendor, min/max stock, reorder quantity, unit cost, bin location, status, and site stock.
- Stock transaction history is immutable.
- Stock issue, return, transfer, adjustment, reservation, and consumption are audited.
- Negative available stock is blocked.
- Low stock alerts are generated from available stock, not only current stock.

### REQ-P1-009: Physical stock count

Requirement:

- Store users must run periodic physical stock counts.

Acceptance criteria:

- Users can create stock count sessions by site/store.
- System freezes expected quantity snapshot.
- Count differences require reason and approval above a configurable threshold.
- Approved differences create adjustment transactions.

### REQ-P1-010: Purchase request and receipt flow

Requirement:

- Spare part reorder requests must mature into a purchase workflow.

Acceptance criteria:

- Reorder can generate purchase request.
- Purchase request supports vendor, quantity, expected date, budget code, remarks, approval status, and attachments.
- Goods receipt updates stock with reference to purchase request.
- Partial receipt is supported.
- Purchase history is visible from spare part and work order views.

### REQ-P1-011: Approval workflow configuration

Requirement:

- Approval rules must be configurable by module, action, site, role, amount, and criticality.

Acceptance criteria:

- Admin can configure approver role, required approval count, fallback approver, and escalation time.
- Approval inbox shows pending approvals with context and aging.
- Approval history is immutable.
- Rejection sends item back to the correct workflow state.

### REQ-P1-012: Notification preferences and escalation

Requirement:

- Notifications must support user preferences, escalation, and multiple channels.

Acceptance criteria:

- Users can configure in-app and email notification preferences.
- Admin can configure default notification rules by role and site.
- Escalation occurs for overdue PM, overdue work orders, pending approvals, and low stock.
- Notification delivery has retry and failure logging.

### REQ-P1-013: Document management

Requirement:

- CMMS records must support controlled document attachments.

Acceptance criteria:

- Equipment, work orders, PM schedules, vendors, spare parts, and approvals can have attachments.
- Files have type, size, owner, upload timestamp, checksum, and related entity.
- Uploads are scanned and validated.
- Users can preview, download, and delete based on permissions.
- Retention policy is configurable.

### REQ-P1-014: Technician mobile experience

Requirement:

- Technicians must be able to execute field work on mobile devices.

Acceptance criteria:

- Mobile layout supports assigned work, equipment scan, checklist completion, spare request, photos, remarks, and signature.
- Offline draft mode is available for poor connectivity areas.
- Conflicts are detected and shown during sync.
- Mobile actions preserve the same permissions as desktop.

### REQ-P1-015: Role and permission administration

Requirement:

- Admin users must manage production roles safely.

Acceptance criteria:

- Roles can be created, inactivated, copied, and assigned to users per site.
- Permission changes are audited.
- The system prevents removal of the last super admin.
- Users can preview effective permissions for a selected user.

## P2 Enterprise Requirements

### REQ-P2-001: Multi-site and organization support

Requirement:

- The system must support multiple sites and organizations with strict data boundaries.

Acceptance criteria:

- Site access is enforced in every list, detail, report, import, and export endpoint.
- Users can switch active site context.
- Reports can aggregate only across authorized sites.
- Time zone and working calendar can be configured by site.

### REQ-P2-002: Audit log and compliance history

Requirement:

- All critical actions must produce immutable audit records.

Acceptance criteria:

- Audit log captures actor, action, entity type, entity id, before value, after value, timestamp, source IP, and correlation id.
- Audit entries cannot be edited through normal application APIs.
- Admins can search and export audit logs.

### REQ-P2-003: Advanced reporting and KPI dashboard

Requirement:

- Managers must have production KPIs beyond basic counts.

Required KPIs:

- PM compliance.
- Schedule compliance.
- Corrective vs preventive ratio.
- MTBF.
- MTTR.
- Downtime by site/equipment/cause.
- Work order backlog.
- Aging by priority.
- Spare stock-outs.
- Inventory valuation.
- Vendor response performance.
- Maintenance cost by asset.

Acceptance criteria:

- Reports support date range, site, equipment, vendor, status, and export.
- Heavy exports run asynchronously.
- KPI calculations are documented.

### REQ-P2-004: ERP integration

Requirement:

- CMMS should integrate with ERP or finance systems for vendor, purchase, stock, and cost data.

Acceptance criteria:

- Integration supports master data sync for vendors, materials, cost centers, and employee records.
- Purchase request and receipt events can be sent to ERP.
- Integration failures are retried and visible in an admin queue.
- Idempotency keys prevent duplicate external transactions.

### REQ-P2-005: HR/identity integration

Requirement:

- User identity should integrate with enterprise identity providers.

Acceptance criteria:

- SSO supports SAML or OIDC.
- Users can be mapped to roles and sites from identity attributes or admin assignment.
- Deactivated identity users lose access automatically.
- MFA is supported through the identity provider.

### REQ-P2-006: Data import governance

Requirement:

- Bulk imports must be safe, reviewable, and reversible.

Acceptance criteria:

- Import templates exist for sites, employees, equipment, vendors, spare parts, opening stock, and PM schedules.
- Import has preview, validation errors, dry run, and commit step.
- Each import run has run id, file checksum, actor, row counts, success count, failure count, and rollback/export file.

### REQ-P2-007: Backup, restore, and disaster recovery

Requirement:

- Production data must have a tested recovery plan.

Acceptance criteria:

- Database backup schedule is documented and automated.
- File storage backup is included.
- Recovery point objective and recovery time objective are approved.
- Restore is tested at least once per release cycle or quarter.

### REQ-P2-008: Performance and scalability targets

Requirement:

- The system must meet explicit production performance targets.

Acceptance criteria:

- 95th percentile API latency for normal list/detail actions is below 500 ms under expected load.
- Dashboard loads within 3 seconds for authorized sites.
- Frontend first load is optimized through route-level code splitting.
- Search endpoints enforce pagination.
- Scheduled jobs are idempotent and safe in multi-instance deployments.

### REQ-P2-009: Accessibility and usability

Requirement:

- The frontend must be usable by operations teams across devices and abilities.

Acceptance criteria:

- Main workflows are keyboard accessible.
- Form errors are announced and visible.
- Tables support accessible labels and predictable focus.
- Color is not the only signal for status.
- Responsive layouts are verified for desktop, tablet, and mobile.

## P3 Strategic Requirements

### REQ-P3-001: Predictive maintenance readiness

Requirement:

- The system should support condition-based and predictive maintenance use cases.

Acceptance criteria:

- Equipment can store condition parameters such as vibration, temperature, pressure, current, runtime, and process-specific metrics.
- Threshold rules can create alerts or work orders.
- External IoT or SCADA readings can be ingested through a controlled API.
- Historical readings can be trended and exported.

### REQ-P3-002: AI-assisted maintenance recommendations

Requirement:

- The system may provide recommendations based on historical work orders, downtime, and spare usage.

Acceptance criteria:

- Recommendations are explainable and show source history.
- Users can accept, dismiss, or provide feedback.
- AI output never changes work order or inventory state without human approval.

### REQ-P3-003: Vendor portal

Requirement:

- External vendors may access assigned work securely.

Acceptance criteria:

- Vendor users can see only assigned work.
- Vendors can update visit date, remarks, completion evidence, and invoice reference.
- Vendor access is time-bound and audited.

### REQ-P3-004: Maintenance budgeting

Requirement:

- Maintenance managers should plan and track budgets.

Acceptance criteria:

- Costs can be assigned to work order, equipment, site, vendor, and cost center.
- Planned vs actual maintenance cost reports are available.
- Approval rules can use amount thresholds.

## Suggested Roadmap

### Release 1: Production Pilot

- Environment configuration.
- Enforced backend RBAC.
- Basic CI/CD.
- Health checks and logs.
- Accurate documentation.
- Core work order, equipment, PM, spare, approval, and notification flows stabilized.

### Release 2: Operational Hardening

- Full automated test suite.
- Scheduler locking.
- Audit log.
- File/document management.
- Stock count.
- Improved purchase request flow.
- Mobile technician UI.

### Release 3: Enterprise Rollout

- SSO/MFA.
- ERP integration.
- Advanced reports and KPI dashboards.
- Data import governance.
- Disaster recovery rehearsal.

### Release 4: Optimization and Intelligence

- Meter-based PM.
- Condition monitoring integration.
- Predictive maintenance.
- Vendor portal.
- Budgeting and cost analytics.

## Open Product Questions

- Which roles are mandatory for go-live: technician, maintenance manager, store user, site admin, HR admin, super admin, vendor?
- Is the deployment single-company or multi-company?
- Which ERP or procurement system must integrate first?
- Is mobile offline mode mandatory for the first production rollout?
- What are the approved RPO and RTO targets?
- Are electronic signatures or regulated audit requirements required?
- Which reports are legally or contractually required?
- What data volume should performance tests use for equipment, work orders, transactions, and notifications?

## Definition of Production Ready

The CMMS should be considered production ready only when:

- Real secrets are externalized and rotated.
- RBAC and site restrictions are enforced by backend tests.
- Liquibase migrations pass from a clean database.
- CI/CD gates are mandatory.
- Health checks, logs, metrics, and alerts exist.
- Demo credentials and stale docs are removed.
- Core maintenance workflows have automated tests.
- Backup and restore are documented and tested.
- Support teams have a deployment and incident runbook.
