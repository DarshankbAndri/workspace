# Feature automation coverage

Updated 2026-11-26. This inventory identifies executable suites, not complete scenario coverage. Runtime results are separate from implemented tests. See [the audit, implementation plan and remaining backlog](AUTOMATION_PLAN.md).

| Feature | Executable tests under tests/ | Assertions and limits |
|---|---|---|
| Authentication/accounts | auth/authentication.spec.ts, auth/account-lifecycle.spec.ts | Login, refresh/logout UI, password failures/change, disabled account, live permission removal. Stateless logout is not token revocation. |
| Permission/site isolation | security/rbac.spec.ts, security/cross-site-security.spec.ts | Self-created non-admin accounts; allowed read, denied write, direct ID/list/search and hostile site filter. Not an exhaustive default-role matrix. |
| Company | configuration/company.spec.ts | Create if absent, update/restore, duplicate code, invalid email/name. Logo interaction remains a gap. |
| Sites/UI navigation | site/site-crud.spec.ts, ui/site-navigation.spec.ts | CRUD, duplicate, search, list/view/edit/save, viewer edit denial. Other modules have route smoke rather than full form interaction. |
| Employees/vendors/equipment | integration/master-data.spec.ts, integration/master-data-lifecycles.spec.ts | Relationships, edits and selected duplicate/validation cases. |
| Roles/users | integration/master-data-lifecycles.spec.ts, auth/account-lifecycle.spec.ts | Role catalog/CRUD; permission and role removal on existing token; employee account state. |
| Equipment documents/BOM | equipment/documents.spec.ts, equipment/spare-bom.spec.ts | Upload/download/delete, BOM persistence, duplicate/quantity/site validation. |
| Maintenance | workflow/complete-maintenance-lifecycle.spec.ts, workflow/maintenance-rejection-lifecycle.spec.ts | Request/assignment synchronization, completion and invalid/cancelled flows. |
| My Assignments | assignment/my-assignments.spec.ts | Real technician identity and attempted filter impersonation; linked profile identity. |
| Checklist | assignment/checklist-execution.spec.ts | Required step/proof gates, invalid status, persisted completion, proof bytes, wrong-assignment IDs. Propagation variants additionally have backend unit tests. |
| Work logs | assignment/work-log-attachments.spec.ts | Invalid time, update, persisted action, attachment round trip/deletion and wrong-parent ID. |
| Approvals | configuration/approval-and-notifications.spec.ts | Real approver approve/reject, unauthorized actor, repeated decisions, request/history state. Multiple-approver and wrong-role/site permutations remain. |
| Downtime | downtime/downtime-lifecycle.spec.ts | Status sequence, RCA, duration and invalid transition. |
| Inventory | spare-parts/inventory.spec.ts, spare-parts/spare-workflow.spec.ts | Receipt/adjust ledger, manager approve/reject, stock reservation, issue, partial consume/return, release on cancellation, linked shortage purchase/receipt. Concurrency and transfer/import remain. |
| PM | preventive-maintenance/schedule.spec.ts | Create/read, sequential generation dates, persisted next due date, invalid frequency. Does not prove concurrent scheduler idempotency. |
| AMC | vendor-amc/vendor-amc.spec.ts | Mapping, date validation, renewal linkage and preservation of original dates/mapping. |
| Notifications | notification/notification-permissions.spec.ts, configuration/approval-and-notifications.spec.ts | Inbox/count, approver recipient ownership, read/archive, settings validation/restoration. External delivery/SSE reconnect remain. |
| Reports/dashboard | report/deterministic-reports.spec.ts | Exact purchase/maintenance totals, three cost groups, history records, equipment KPI, forbidden other-site reporting. Other aggregate/widget fixtures remain. |
| Search/time | pagination/search-sort-filter.spec.ts, regression/date-time-and-validation.spec.ts | Thirteen search endpoints, paging/hostile inputs, UTC/time contracts. |
| API contracts | api/api-contract.spec.ts, api/unauthenticated-endpoints.spec.ts | Live OpenAPI/Axios/permission alignment and anonymous sweep. These do not prove business behavior. |
| UI smoke | smoke/smoke.spec.ts, ui/all-module-routes.spec.ts | Basic route/API/browser-error checks, not full form workflows or accessibility. |

Global configuration cases run in a single-worker project after ordinary tests, with restoration. Non-admin accounts are created by fixtures, not optional credentials. The generated API inventory only counts method/path references and explicitly avoids claiming a functional coverage percentage.
