# API automation inventory

This is a static method-and-path reference inventory, **not a test pass rate or proof of full scenario coverage**. A request can be setup, a negative assertion, or cleanup. See the scenario plan and Playwright results for behavior and execution evidence. Dynamic route variables/loops and helper calls may be undercounted. Unreferenced operations remain gaps for review; anonymous/contract sweeps do not prove business correctness.

| Controller | Method | Endpoint | Direct request references |
|---|---|---|---|
| ApprovalConfigController | GET | `/admin/approval-config` | [tests/configuration/approval-and-notifications.spec.ts:15](../tests/configuration/approval-and-notifications.spec.ts#L15) |
| ApprovalConfigController | POST | `/admin/approval-config` | No statically resolved reference |
| ApprovalConfigController | PUT | `/admin/approval-config/{id}` | [tests/configuration/approval-and-notifications.spec.ts:18](../tests/configuration/approval-and-notifications.spec.ts#L18), [tests/configuration/approval-and-notifications.spec.ts:19](../tests/configuration/approval-and-notifications.spec.ts#L19) |
| ApprovalController | GET | `/approvals/{approvalRequestId}` | No statically resolved reference |
| ApprovalController | POST | `/approvals/{approvalRequestId}/approve` | [tests/configuration/approval-and-notifications.spec.ts:28](../tests/configuration/approval-and-notifications.spec.ts#L28) |
| ApprovalController | POST | `/approvals/{approvalRequestId}/reject` | No statically resolved reference |
| ApprovalController | GET | `/approvals/history` | [tests/configuration/approval-and-notifications.spec.ts:38](../tests/configuration/approval-and-notifications.spec.ts#L38) |
| ApprovalController | POST | `/approvals/history/search` | No statically resolved reference |
| ApprovalController | GET | `/approvals/pending` | [tests/configuration/approval-and-notifications.spec.ts:25](../tests/configuration/approval-and-notifications.spec.ts#L25) |
| ApprovalController | POST | `/approvals/pending/search` | [tests/pagination/search-sort-filter.spec.ts:54](../tests/pagination/search-sort-filter.spec.ts#L54) |
| AuthController | POST | `/auth/change-password` | [tests/auth/account-lifecycle.spec.ts:13](../tests/auth/account-lifecycle.spec.ts#L13), [tests/auth/account-lifecycle.spec.ts:16](../tests/auth/account-lifecycle.spec.ts#L16), [tests/auth/account-lifecycle.spec.ts:19](../tests/auth/account-lifecycle.spec.ts#L19) |
| AuthController | POST | `/auth/login` | [tests/auth/account-lifecycle.spec.ts:24](../tests/auth/account-lifecycle.spec.ts#L24), [tests/auth/account-lifecycle.spec.ts:27](../tests/auth/account-lifecycle.spec.ts#L27), [tests/auth/account-lifecycle.spec.ts:34](../tests/auth/account-lifecycle.spec.ts#L34), [tests/auth/authentication.spec.ts:20](../tests/auth/authentication.spec.ts#L20), [tests/auth/authentication.spec.ts:21](../tests/auth/authentication.spec.ts#L21), [tests/auth/authentication.spec.ts:32](../tests/auth/authentication.spec.ts#L32), [tests/ui/site-navigation.spec.ts:38](../tests/ui/site-navigation.spec.ts#L38) |
| AuthController | POST | `/auth/logout` | No statically resolved reference |
| AuthController | GET | `/auth/me` | [tests/notification/notification-permissions.spec.ts:4](../tests/notification/notification-permissions.spec.ts#L4), [tests/security/rbac.spec.ts:22](../tests/security/rbac.spec.ts#L22) |
| AuthController | GET | `/auth/profile` | [tests/assignment/my-assignments.spec.ts:24](../tests/assignment/my-assignments.spec.ts#L24) |
| AuthController | POST | `/auth/profile/avatar` | No statically resolved reference |
| AuthController | GET | `/auth/profile/avatar/{fileName:.+}` | No statically resolved reference |
| AuthController | POST | `/auth/refresh` | [tests/auth/account-lifecycle.spec.ts:37](../tests/auth/account-lifecycle.spec.ts#L37), [tests/auth/authentication.spec.ts:51](../tests/auth/authentication.spec.ts#L51) |
| CompanyController | GET | `/company/{id}` | [tests/configuration/company.spec.ts:15](../tests/configuration/company.spec.ts#L15) |
| CompanyController | POST | `/company/create` | [tests/configuration/company.spec.ts:8](../tests/configuration/company.spec.ts#L8), [tests/configuration/company.spec.ts:18](../tests/configuration/company.spec.ts#L18) |
| CompanyController | GET | `/company/current` | [tests/configuration/company.spec.ts:6](../tests/configuration/company.spec.ts#L6), [tests/configuration/company.spec.ts:21](../tests/configuration/company.spec.ts#L21) |
| CompanyController | GET | `/company/logo/{fileName:.+}` | No statically resolved reference |
| CompanyController | PUT | `/company/update/{id}` | [tests/configuration/company.spec.ts:13](../tests/configuration/company.spec.ts#L13), [tests/configuration/company.spec.ts:14](../tests/configuration/company.spec.ts#L14), [tests/configuration/company.spec.ts:19](../tests/configuration/company.spec.ts#L19), [tests/configuration/company.spec.ts:20](../tests/configuration/company.spec.ts#L20) |
| CompanyController | POST | `/company/upload-logo` | No statically resolved reference |
| DashboardController | GET | `/dashboard/me` | No statically resolved reference |
| DashboardController | GET | `/dashboard/overview` | No statically resolved reference |
| DashboardController | GET | `/dashboard/summary` | [tests/report/deterministic-reports.spec.ts:34](../tests/report/deterministic-reports.spec.ts#L34), [tests/report/deterministic-reports.spec.ts:41](../tests/report/deterministic-reports.spec.ts#L41) |
| DashboardController | GET | `/dashboard/widgets/equipment/status` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/inventory/low-stock` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/inventory/reorder-queue` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/maintenance/assignment-queue` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/maintenance/open-requests` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/maintenance/pm-due` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/overview/kpi-summary` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/reports/downtime-summary` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/technician/my-jobs` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/vendor-amc/active-contracts` | No statically resolved reference |
| DashboardController | GET | `/dashboard/widgets/vendor-amc/performance` | No statically resolved reference |
| EmployeeController | GET | `/hr/employees` | No statically resolved reference |
| EmployeeController | POST | `/hr/employees` | [tests/integration/master-data-lifecycles.spec.ts:21](../tests/integration/master-data-lifecycles.spec.ts#L21) |
| EmployeeController | DELETE | `/hr/employees/{id}` | No statically resolved reference |
| EmployeeController | GET | `/hr/employees/{id}` | No statically resolved reference |
| EmployeeController | PUT | `/hr/employees/{id}` | [tests/auth/account-lifecycle.spec.ts:31](../tests/auth/account-lifecycle.spec.ts#L31), [tests/integration/master-data-lifecycles.spec.ts:8](../tests/integration/master-data-lifecycles.spec.ts#L8) |
| EmployeeController | POST | `/hr/employees/search` | No statically resolved reference |
| EquipmentController | GET | `/equipment` | [tests/auth/authentication.spec.ts:40](../tests/auth/authentication.spec.ts#L40), [tests/auth/authentication.spec.ts:41](../tests/auth/authentication.spec.ts#L41), [tests/security/cross-site-security.spec.ts:32](../tests/security/cross-site-security.spec.ts#L32), [tests/security/rbac.spec.ts:12](../tests/security/rbac.spec.ts#L12) |
| EquipmentController | POST | `/equipment` | [tests/integration/master-data-lifecycles.spec.ts:20](../tests/integration/master-data-lifecycles.spec.ts#L20), [tests/integration/master-data.spec.ts:15](../tests/integration/master-data.spec.ts#L15), [tests/security/cross-site-security.spec.ts:15](../tests/security/cross-site-security.spec.ts#L15) |
| EquipmentController | DELETE | `/equipment/{id}` | [tests/security/cross-site-security.spec.ts:16](../tests/security/cross-site-security.spec.ts#L16), [tests/security/cross-site-security.spec.ts:31](../tests/security/cross-site-security.spec.ts#L31) |
| EquipmentController | GET | `/equipment/{id}` | [tests/auth/account-lifecycle.spec.ts:44](../tests/auth/account-lifecycle.spec.ts#L44), [tests/auth/account-lifecycle.spec.ts:46](../tests/auth/account-lifecycle.spec.ts#L46), [tests/auth/account-lifecycle.spec.ts:48](../tests/auth/account-lifecycle.spec.ts#L48), [tests/auth/account-lifecycle.spec.ts:50](../tests/auth/account-lifecycle.spec.ts#L50), [tests/auth/account-lifecycle.spec.ts:52](../tests/auth/account-lifecycle.spec.ts#L52), [tests/integration/master-data.spec.ts:8](../tests/integration/master-data.spec.ts#L8), [tests/security/cross-site-security.spec.ts:27](../tests/security/cross-site-security.spec.ts#L27), [tests/security/cross-site-security.spec.ts:42](../tests/security/cross-site-security.spec.ts#L42) |
| EquipmentController | PUT | `/equipment/{id}` | [tests/integration/master-data-lifecycles.spec.ts:16](../tests/integration/master-data-lifecycles.spec.ts#L16), [tests/report/deterministic-reports.spec.ts:12](../tests/report/deterministic-reports.spec.ts#L12) |
| EquipmentController | GET | `/equipment/{id}/active-amc` | No statically resolved reference |
| EquipmentController | GET | `/equipment/{id}/amc-contracts` | No statically resolved reference |
| EquipmentController | GET | `/equipment/{id}/checklists` | No statically resolved reference |
| EquipmentController | GET | `/equipment/{id}/documents` | [tests/equipment/documents.spec.ts:15](../tests/equipment/documents.spec.ts#L15) |
| EquipmentController | POST | `/equipment/{id}/documents` | [tests/equipment/documents.spec.ts:10](../tests/equipment/documents.spec.ts#L10), [tests/equipment/documents.spec.ts:20](../tests/equipment/documents.spec.ts#L20) |
| EquipmentController | DELETE | `/equipment/{id}/documents/{documentId}` | [tests/equipment/documents.spec.ts:14](../tests/equipment/documents.spec.ts#L14) |
| EquipmentController | GET | `/equipment/{id}/documents/{documentId}/file` | [tests/equipment/documents.spec.ts:17](../tests/equipment/documents.spec.ts#L17) |
| EquipmentController | GET | `/equipment/{id}/health` | No statically resolved reference |
| EquipmentController | GET | `/equipment/{id}/spare-bom` | [tests/equipment/spare-bom.spec.ts:19](../tests/equipment/spare-bom.spec.ts#L19), [tests/equipment/spare-bom.spec.ts:25](../tests/equipment/spare-bom.spec.ts#L25) |
| EquipmentController | POST | `/equipment/{id}/spare-bom` | [tests/equipment/spare-bom.spec.ts:9](../tests/equipment/spare-bom.spec.ts#L9), [tests/equipment/spare-bom.spec.ts:14](../tests/equipment/spare-bom.spec.ts#L14), [tests/equipment/spare-bom.spec.ts:22](../tests/equipment/spare-bom.spec.ts#L22) |
| EquipmentController | DELETE | `/equipment/{id}/spare-bom/{bomId}` | [tests/equipment/spare-bom.spec.ts:12](../tests/equipment/spare-bom.spec.ts#L12), [tests/equipment/spare-bom.spec.ts:23](../tests/equipment/spare-bom.spec.ts#L23) |
| EquipmentController | PUT | `/equipment/{id}/spare-bom/{bomId}` | [tests/equipment/spare-bom.spec.ts:15](../tests/equipment/spare-bom.spec.ts#L15), [tests/equipment/spare-bom.spec.ts:18](../tests/equipment/spare-bom.spec.ts#L18) |
| EquipmentController | GET | `/equipment/{id}/summary` | No statically resolved reference |
| EquipmentController | POST | `/equipment/search` | [tests/integration/master-data.spec.ts:10](../tests/integration/master-data.spec.ts#L10), [tests/pagination/search-sort-filter.spec.ts:40](../tests/pagination/search-sort-filter.spec.ts#L40), [tests/pagination/search-sort-filter.spec.ts:45](../tests/pagination/search-sort-filter.spec.ts#L45), [tests/pagination/search-sort-filter.spec.ts:50](../tests/pagination/search-sort-filter.spec.ts#L50), [tests/security/cross-site-security.spec.ts:35](../tests/security/cross-site-security.spec.ts#L35), [tests/security/cross-site-security.spec.ts:38](../tests/security/cross-site-security.spec.ts#L38) |
| EquipmentDowntimeController | GET | `/maintenance/downtime` | No statically resolved reference |
| EquipmentDowntimeController | POST | `/maintenance/downtime` | [tests/downtime/downtime-lifecycle.spec.ts:7](../tests/downtime/downtime-lifecycle.spec.ts#L7), [tests/regression/date-time-and-validation.spec.ts:14](../tests/regression/date-time-and-validation.spec.ts#L14) |
| EquipmentDowntimeController | DELETE | `/maintenance/downtime/{id}` | [tests/downtime/downtime-lifecycle.spec.ts:11](../tests/downtime/downtime-lifecycle.spec.ts#L11) |
| EquipmentDowntimeController | GET | `/maintenance/downtime/{id}` | No statically resolved reference |
| EquipmentDowntimeController | PUT | `/maintenance/downtime/{id}` | No statically resolved reference |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/close` | [tests/downtime/downtime-lifecycle.spec.ts:25](../tests/downtime/downtime-lifecycle.spec.ts#L25) |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/confirm` | [tests/downtime/downtime-lifecycle.spec.ts:12](../tests/downtime/downtime-lifecycle.spec.ts#L12), [tests/downtime/downtime-lifecycle.spec.ts:28](../tests/downtime/downtime-lifecycle.spec.ts#L28) |
| EquipmentDowntimeController | GET | `/maintenance/downtime/{id}/rca-actions` | No statically resolved reference |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/rca-actions` | [tests/downtime/downtime-lifecycle.spec.ts:20](../tests/downtime/downtime-lifecycle.spec.ts#L20) |
| EquipmentDowntimeController | PUT | `/maintenance/downtime/{id}/rca-actions/{actionId}` | No statically resolved reference |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/reopen` | No statically resolved reference |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/restore` | [tests/downtime/downtime-lifecycle.spec.ts:14](../tests/downtime/downtime-lifecycle.spec.ts#L14) |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/start-maintenance` | [tests/downtime/downtime-lifecycle.spec.ts:13](../tests/downtime/downtime-lifecycle.spec.ts#L13) |
| EquipmentDowntimeController | GET | `/maintenance/downtime/{id}/timeline` | [tests/downtime/downtime-lifecycle.spec.ts:26](../tests/downtime/downtime-lifecycle.spec.ts#L26) |
| EquipmentDowntimeController | POST | `/maintenance/downtime/{id}/verify` | [tests/downtime/downtime-lifecycle.spec.ts:17](../tests/downtime/downtime-lifecycle.spec.ts#L17) |
| EquipmentDowntimeController | POST | `/maintenance/downtime/search` | No statically resolved reference |
| MaintenanceAssignmentController | GET | `/maintenance/assignments` | No statically resolved reference |
| MaintenanceAssignmentController | POST | `/maintenance/assignments` | [tests/workflow/maintenance-rejection-lifecycle.spec.ts:14](../tests/workflow/maintenance-rejection-lifecycle.spec.ts#L14) |
| MaintenanceAssignmentController | GET | `/maintenance/assignments/{assignmentId}/checklist` | [tests/assignment/checklist-execution.spec.ts:37](../tests/assignment/checklist-execution.spec.ts#L37), [tests/assignment/checklist-execution.spec.ts:53](../tests/assignment/checklist-execution.spec.ts#L53) |
| MaintenanceAssignmentController | POST | `/maintenance/assignments/{assignmentId}/checklist` | [tests/assignment/checklist-execution.spec.ts:17](../tests/assignment/checklist-execution.spec.ts#L17), [tests/assignment/checklist-execution.spec.ts:47](../tests/assignment/checklist-execution.spec.ts#L47) |
| MaintenanceAssignmentController | DELETE | `/maintenance/assignments/{assignmentId}/checklist/{itemId}` | [tests/assignment/checklist-execution.spec.ts:18](../tests/assignment/checklist-execution.spec.ts#L18), [tests/assignment/checklist-execution.spec.ts:48](../tests/assignment/checklist-execution.spec.ts#L48), [tests/assignment/checklist-execution.spec.ts:52](../tests/assignment/checklist-execution.spec.ts#L52) |
| MaintenanceAssignmentController | PUT | `/maintenance/assignments/{assignmentId}/checklist/{itemId}` | [tests/assignment/checklist-execution.spec.ts:22](../tests/assignment/checklist-execution.spec.ts#L22), [tests/assignment/checklist-execution.spec.ts:25](../tests/assignment/checklist-execution.spec.ts#L25), [tests/assignment/checklist-execution.spec.ts:49](../tests/assignment/checklist-execution.spec.ts#L49) |
| MaintenanceAssignmentController | POST | `/maintenance/assignments/{assignmentId}/checklist/{itemId}/proof` | [tests/assignment/checklist-execution.spec.ts:29](../tests/assignment/checklist-execution.spec.ts#L29) |
| MaintenanceAssignmentController | DELETE | `/maintenance/assignments/{assignmentId}/checklist/{itemId}/proof/{proofId}` | [tests/assignment/checklist-execution.spec.ts:33](../tests/assignment/checklist-execution.spec.ts#L33) |
| MaintenanceAssignmentController | GET | `/maintenance/assignments/{assignmentId}/checklist/{itemId}/proof/{proofId}` | [tests/assignment/checklist-execution.spec.ts:34](../tests/assignment/checklist-execution.spec.ts#L34) |
| MaintenanceAssignmentController | GET | `/maintenance/assignments/{assignmentId}/work-logs` | [tests/assignment/work-log-attachments.spec.ts:20](../tests/assignment/work-log-attachments.spec.ts#L20), [tests/assignment/work-log-attachments.spec.ts:36](../tests/assignment/work-log-attachments.spec.ts#L36), [tests/workflow/complete-maintenance-lifecycle.spec.ts:18](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L18) |
| MaintenanceAssignmentController | POST | `/maintenance/assignments/{assignmentId}/work-logs` | [tests/assignment/checklist-execution.spec.ts:11](../tests/assignment/checklist-execution.spec.ts#L11), [tests/assignment/work-log-attachments.spec.ts:11](../tests/assignment/work-log-attachments.spec.ts#L11), [tests/assignment/work-log-attachments.spec.ts:14](../tests/assignment/work-log-attachments.spec.ts#L14), [tests/workflow/complete-maintenance-lifecycle.spec.ts:13](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L13) |
| MaintenanceAssignmentController | DELETE | `/maintenance/assignments/{assignmentId}/work-logs/{workLogId}` | [tests/assignment/checklist-execution.spec.ts:15](../tests/assignment/checklist-execution.spec.ts#L15), [tests/assignment/work-log-attachments.spec.ts:17](../tests/assignment/work-log-attachments.spec.ts#L17), [tests/assignment/work-log-attachments.spec.ts:34](../tests/assignment/work-log-attachments.spec.ts#L34), [tests/workflow/complete-maintenance-lifecycle.spec.ts:17](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L17) |
| MaintenanceAssignmentController | PUT | `/maintenance/assignments/{assignmentId}/work-logs/{workLogId}` | [tests/assignment/work-log-attachments.spec.ts:19](../tests/assignment/work-log-attachments.spec.ts#L19), [tests/assignment/work-log-attachments.spec.ts:22](../tests/assignment/work-log-attachments.spec.ts#L22) |
| MaintenanceAssignmentController | POST | `/maintenance/assignments/{assignmentId}/work-logs/{workLogId}/attachments` | [tests/assignment/work-log-attachments.spec.ts:24](../tests/assignment/work-log-attachments.spec.ts#L24) |
| MaintenanceAssignmentController | DELETE | `/maintenance/assignments/{assignmentId}/work-logs/{workLogId}/attachments/{attachmentId}` | [tests/assignment/work-log-attachments.spec.ts:32](../tests/assignment/work-log-attachments.spec.ts#L32) |
| MaintenanceAssignmentController | GET | `/maintenance/assignments/{assignmentId}/work-logs/{workLogId}/attachments/{attachmentId}` | [tests/assignment/work-log-attachments.spec.ts:28](../tests/assignment/work-log-attachments.spec.ts#L28), [tests/assignment/work-log-attachments.spec.ts:31](../tests/assignment/work-log-attachments.spec.ts#L31), [tests/assignment/work-log-attachments.spec.ts:33](../tests/assignment/work-log-attachments.spec.ts#L33) |
| MaintenanceAssignmentController | DELETE | `/maintenance/assignments/{id}` | No statically resolved reference |
| MaintenanceAssignmentController | GET | `/maintenance/assignments/{id}` | No statically resolved reference |
| MaintenanceAssignmentController | PUT | `/maintenance/assignments/{id}` | [tests/assignment/checklist-execution.spec.ts:10](../tests/assignment/checklist-execution.spec.ts#L10), [tests/assignment/checklist-execution.spec.ts:20](../tests/assignment/checklist-execution.spec.ts#L20), [tests/assignment/checklist-execution.spec.ts:26](../tests/assignment/checklist-execution.spec.ts#L26), [tests/assignment/checklist-execution.spec.ts:39](../tests/assignment/checklist-execution.spec.ts#L39), [tests/assignment/my-assignments.spec.ts:10](../tests/assignment/my-assignments.spec.ts#L10), [tests/report/deterministic-reports.spec.ts:15](../tests/report/deterministic-reports.spec.ts#L15), [tests/workflow/complete-maintenance-lifecycle.spec.ts:9](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L9), [tests/workflow/complete-maintenance-lifecycle.spec.ts:21](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L21) |
| MaintenanceAssignmentController | GET | `/maintenance/assignments/my` | [tests/assignment/my-assignments.spec.ts:14](../tests/assignment/my-assignments.spec.ts#L14) |
| MaintenanceAssignmentController | POST | `/maintenance/assignments/my/search` | [tests/assignment/my-assignments.spec.ts:17](../tests/assignment/my-assignments.spec.ts#L17), [tests/pagination/search-sort-filter.spec.ts:62](../tests/pagination/search-sort-filter.spec.ts#L62), [tests/pagination/search-sort-filter.spec.ts:66](../tests/pagination/search-sort-filter.spec.ts#L66) |
| MaintenanceAssignmentController | POST | `/maintenance/assignments/search` | No statically resolved reference |
| MaintenanceRequestController | GET | `/maintenance/requests` | No statically resolved reference |
| MaintenanceRequestController | POST | `/maintenance/requests` | [tests/configuration/approval-and-notifications.spec.ts:22](../tests/configuration/approval-and-notifications.spec.ts#L22), [tests/security/cross-site-security.spec.ts:17](../tests/security/cross-site-security.spec.ts#L17), [tests/workflow/maintenance-rejection-lifecycle.spec.ts:8](../tests/workflow/maintenance-rejection-lifecycle.spec.ts#L8) |
| MaintenanceRequestController | DELETE | `/maintenance/requests/{id}` | [tests/configuration/approval-and-notifications.spec.ts:23](../tests/configuration/approval-and-notifications.spec.ts#L23), [tests/workflow/maintenance-rejection-lifecycle.spec.ts:9](../tests/workflow/maintenance-rejection-lifecycle.spec.ts#L9) |
| MaintenanceRequestController | GET | `/maintenance/requests/{id}` | [tests/assignment/checklist-execution.spec.ts:40](../tests/assignment/checklist-execution.spec.ts#L40), [tests/configuration/approval-and-notifications.spec.ts:37](../tests/configuration/approval-and-notifications.spec.ts#L37), [tests/workflow/complete-maintenance-lifecycle.spec.ts:7](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L7), [tests/workflow/complete-maintenance-lifecycle.spec.ts:24](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L24), [tests/workflow/maintenance-rejection-lifecycle.spec.ts:11](../tests/workflow/maintenance-rejection-lifecycle.spec.ts#L11) |
| MaintenanceRequestController | PUT | `/maintenance/requests/{id}` | No statically resolved reference |
| MaintenanceRequestController | GET | `/maintenance/requests/{id}/related-records` | [tests/workflow/complete-maintenance-lifecycle.spec.ts:25](../tests/workflow/complete-maintenance-lifecycle.spec.ts#L25) |
| MaintenanceRequestController | POST | `/maintenance/requests/{id}/transition` | [tests/workflow/maintenance-rejection-lifecycle.spec.ts:10](../tests/workflow/maintenance-rejection-lifecycle.spec.ts#L10), [tests/workflow/maintenance-rejection-lifecycle.spec.ts:12](../tests/workflow/maintenance-rejection-lifecycle.spec.ts#L12) |
| MaintenanceRequestController | GET | `/maintenance/requests/context` | No statically resolved reference |
| MaintenanceRequestController | GET | `/maintenance/requests/queue-summary` | No statically resolved reference |
| MaintenanceRequestController | POST | `/maintenance/requests/search` | No statically resolved reference |
| MaintenanceSpareUsageController | GET | `/maintenance/assignments/{assignmentId}/spares` | No statically resolved reference |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares` | [tests/spare-parts/spare-workflow.spec.ts:37](../tests/spare-parts/spare-workflow.spec.ts#L37) |
| MaintenanceSpareUsageController | DELETE | `/maintenance/assignments/{assignmentId}/spares/{usageId}` | [tests/spare-parts/spare-workflow.spec.ts:38](../tests/spare-parts/spare-workflow.spec.ts#L38), [tests/spare-parts/spare-workflow.spec.ts:49](../tests/spare-parts/spare-workflow.spec.ts#L49) |
| MaintenanceSpareUsageController | PUT | `/maintenance/assignments/{assignmentId}/spares/{usageId}` | No statically resolved reference |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares/{usageId}/cancel` | [tests/spare-parts/spare-workflow.spec.ts:42](../tests/spare-parts/spare-workflow.spec.ts#L42) |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares/{usageId}/consume` | No statically resolved reference |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares/{usageId}/issue` | No statically resolved reference |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares/{usageId}/reject` | No statically resolved reference |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares/{usageId}/reserve` | No statically resolved reference |
| MaintenanceSpareUsageController | POST | `/maintenance/assignments/{assignmentId}/spares/{usageId}/return` | No statically resolved reference |
| NotificationController | GET | `/notifications` | [tests/configuration/approval-and-notifications.spec.ts:29](../tests/configuration/approval-and-notifications.spec.ts#L29), [tests/notification/notification-permissions.spec.ts:9](../tests/notification/notification-permissions.spec.ts#L9) |
| NotificationController | PUT | `/notifications/{id}/archive` | [tests/configuration/approval-and-notifications.spec.ts:34](../tests/configuration/approval-and-notifications.spec.ts#L34) |
| NotificationController | PUT | `/notifications/{id}/read` | [tests/configuration/approval-and-notifications.spec.ts:32](../tests/configuration/approval-and-notifications.spec.ts#L32), [tests/configuration/approval-and-notifications.spec.ts:33](../tests/configuration/approval-and-notifications.spec.ts#L33) |
| NotificationController | PUT | `/notifications/read-all` | No statically resolved reference |
| NotificationController | GET | `/notifications/stream` | No statically resolved reference |
| NotificationController | GET | `/notifications/unread-count` | [tests/notification/notification-permissions.spec.ts:11](../tests/notification/notification-permissions.spec.ts#L11) |
| NotificationSettingsController | GET | `/admin/notification-settings` | [tests/configuration/approval-and-notifications.spec.ts:45](../tests/configuration/approval-and-notifications.spec.ts#L45), [tests/configuration/approval-and-notifications.spec.ts:49](../tests/configuration/approval-and-notifications.spec.ts#L49), [tests/configuration/approval-and-notifications.spec.ts:55](../tests/configuration/approval-and-notifications.spec.ts#L55), [tests/notification/notification-permissions.spec.ts:13](../tests/notification/notification-permissions.spec.ts#L13) |
| NotificationSettingsController | PUT | `/admin/notification-settings` | [tests/configuration/approval-and-notifications.spec.ts:46](../tests/configuration/approval-and-notifications.spec.ts#L46), [tests/configuration/approval-and-notifications.spec.ts:48](../tests/configuration/approval-and-notifications.spec.ts#L48), [tests/configuration/approval-and-notifications.spec.ts:53](../tests/configuration/approval-and-notifications.spec.ts#L53), [tests/configuration/approval-and-notifications.spec.ts:54](../tests/configuration/approval-and-notifications.spec.ts#L54) |
| PermissionController | GET | `/admin/permissions` | [tests/integration/master-data-lifecycles.spec.ts:25](../tests/integration/master-data-lifecycles.spec.ts#L25) |
| PermissionController | GET | `/admin/permissions/grouped` | No statically resolved reference |
| PreventiveMaintenanceCalendarController | GET | `/preventive-maintenance/calendar` | No statically resolved reference |
| PreventiveMaintenanceScheduleController | GET | `/preventive-maintenance/schedules` | No statically resolved reference |
| PreventiveMaintenanceScheduleController | POST | `/preventive-maintenance/schedules` | [tests/preventive-maintenance/schedule.spec.ts:12](../tests/preventive-maintenance/schedule.spec.ts#L12), [tests/preventive-maintenance/schedule.spec.ts:24](../tests/preventive-maintenance/schedule.spec.ts#L24) |
| PreventiveMaintenanceScheduleController | DELETE | `/preventive-maintenance/schedules/{id}` | [tests/preventive-maintenance/schedule.spec.ts:13](../tests/preventive-maintenance/schedule.spec.ts#L13) |
| PreventiveMaintenanceScheduleController | GET | `/preventive-maintenance/schedules/{id}` | [tests/preventive-maintenance/schedule.spec.ts:15](../tests/preventive-maintenance/schedule.spec.ts#L15), [tests/preventive-maintenance/schedule.spec.ts:22](../tests/preventive-maintenance/schedule.spec.ts#L22) |
| PreventiveMaintenanceScheduleController | PUT | `/preventive-maintenance/schedules/{id}` | No statically resolved reference |
| PreventiveMaintenanceScheduleController | POST | `/preventive-maintenance/schedules/{id}/generate-work-order` | [tests/preventive-maintenance/schedule.spec.ts:16](../tests/preventive-maintenance/schedule.spec.ts#L16), [tests/preventive-maintenance/schedule.spec.ts:19](../tests/preventive-maintenance/schedule.spec.ts#L19) |
| PreventiveMaintenanceScheduleController | POST | `/preventive-maintenance/schedules/generate-due-work-orders` | No statically resolved reference |
| PreventiveMaintenanceScheduleController | POST | `/preventive-maintenance/schedules/search` | No statically resolved reference |
| PreventiveMaintenanceScheduleController | GET | `/preventive-maintenance/schedules/upcoming` | No statically resolved reference |
| ReportController | GET | `/reports/downtime-analysis` | No statically resolved reference |
| ReportController | GET | `/reports/equipment-cost-by-category` | No statically resolved reference |
| ReportController | GET | `/reports/equipment-cost-by-criticality` | No statically resolved reference |
| ReportController | GET | `/reports/equipment-cost-by-site` | No statically resolved reference |
| ReportController | GET | `/reports/equipment-history` | [tests/report/deterministic-reports.spec.ts:31](../tests/report/deterministic-reports.spec.ts#L31) |
| ReportController | GET | `/reports/equipment-maintenance-cost` | [tests/report/deterministic-reports.spec.ts:18](../tests/report/deterministic-reports.spec.ts#L18), [tests/report/deterministic-reports.spec.ts:38](../tests/report/deterministic-reports.spec.ts#L38), [tests/report/deterministic-reports.spec.ts:40](../tests/report/deterministic-reports.spec.ts#L40) |
| RoleController | GET | `/admin/roles` | No statically resolved reference |
| RoleController | POST | `/admin/roles` | [tests/integration/master-data-lifecycles.spec.ts:29](../tests/integration/master-data-lifecycles.spec.ts#L29), [tests/integration/master-data-lifecycles.spec.ts:38](../tests/integration/master-data-lifecycles.spec.ts#L38) |
| RoleController | DELETE | `/admin/roles/{id}` | [tests/integration/master-data-lifecycles.spec.ts:32](../tests/integration/master-data-lifecycles.spec.ts#L32) |
| RoleController | GET | `/admin/roles/{id}` | No statically resolved reference |
| RoleController | PUT | `/admin/roles/{id}` | [tests/auth/account-lifecycle.spec.ts:45](../tests/auth/account-lifecycle.spec.ts#L45), [tests/auth/account-lifecycle.spec.ts:47](../tests/auth/account-lifecycle.spec.ts#L47), [tests/integration/master-data-lifecycles.spec.ts:34](../tests/integration/master-data-lifecycles.spec.ts#L34) |
| RoleController | POST | `/admin/roles/search` | No statically resolved reference |
| SiteController | GET | `/hr/sites` | No statically resolved reference |
| SiteController | POST | `/hr/sites` | [tests/security/cross-site-security.spec.ts:11](../tests/security/cross-site-security.spec.ts#L11), [tests/security/cross-site-security.spec.ts:13](../tests/security/cross-site-security.spec.ts#L13), [tests/security/rbac.spec.ts:8](../tests/security/rbac.spec.ts#L8), [tests/site/site-crud.spec.ts:8](../tests/site/site-crud.spec.ts#L8), [tests/site/site-crud.spec.ts:23](../tests/site/site-crud.spec.ts#L23), [tests/site/site-crud.spec.ts:25](../tests/site/site-crud.spec.ts#L25), [tests/site/site-crud.spec.ts:26](../tests/site/site-crud.spec.ts#L26), [tests/ui/site-navigation.spec.ts:35](../tests/ui/site-navigation.spec.ts#L35) |
| SiteController | DELETE | `/hr/sites/{id}` | [tests/security/cross-site-security.spec.ts:12](../tests/security/cross-site-security.spec.ts#L12), [tests/security/cross-site-security.spec.ts:14](../tests/security/cross-site-security.spec.ts#L14), [tests/security/rbac.spec.ts:9](../tests/security/rbac.spec.ts#L9), [tests/security/rbac.spec.ts:17](../tests/security/rbac.spec.ts#L17), [tests/site/site-crud.spec.ts:9](../tests/site/site-crud.spec.ts#L9), [tests/site/site-crud.spec.ts:24](../tests/site/site-crud.spec.ts#L24), [tests/ui/site-navigation.spec.ts:17](../tests/ui/site-navigation.spec.ts#L17), [tests/ui/site-navigation.spec.ts:36](../tests/ui/site-navigation.spec.ts#L36) |
| SiteController | GET | `/hr/sites/{id}` | [tests/security/rbac.spec.ts:11](../tests/security/rbac.spec.ts#L11), [tests/site/site-crud.spec.ts:11](../tests/site/site-crud.spec.ts#L11), [tests/ui/site-navigation.spec.ts:31](../tests/ui/site-navigation.spec.ts#L31) |
| SiteController | PUT | `/hr/sites/{id}` | [tests/security/rbac.spec.ts:16](../tests/security/rbac.spec.ts#L16), [tests/site/site-crud.spec.ts:12](../tests/site/site-crud.spec.ts#L12) |
| SiteController | POST | `/hr/sites/search` | [tests/site/site-crud.spec.ts:14](../tests/site/site-crud.spec.ts#L14) |
| SparePartController | POST | `/spare-parts` | No statically resolved reference |
| SparePartController | DELETE | `/spare-parts/{stockId}` | No statically resolved reference |
| SparePartController | GET | `/spare-parts/{stockId}` | [tests/spare-parts/spare-workflow.spec.ts:17](../tests/spare-parts/spare-workflow.spec.ts#L17), [tests/spare-parts/spare-workflow.spec.ts:25](../tests/spare-parts/spare-workflow.spec.ts#L25), [tests/spare-parts/spare-workflow.spec.ts:31](../tests/spare-parts/spare-workflow.spec.ts#L31), [tests/spare-parts/spare-workflow.spec.ts:43](../tests/spare-parts/spare-workflow.spec.ts#L43), [tests/spare-parts/spare-workflow.spec.ts:67](../tests/spare-parts/spare-workflow.spec.ts#L67) |
| SparePartController | PUT | `/spare-parts/{stockId}` | No statically resolved reference |
| SparePartController | POST | `/spare-parts/{stockId}/adjust` | [tests/spare-parts/inventory.spec.ts:13](../tests/spare-parts/inventory.spec.ts#L13) |
| SparePartController | GET | `/spare-parts/{stockId}/equipment-bom` | No statically resolved reference |
| SparePartController | POST | `/spare-parts/{stockId}/equipment-bom` | No statically resolved reference |
| SparePartController | DELETE | `/spare-parts/{stockId}/equipment-bom/{bomId}` | No statically resolved reference |
| SparePartController | PUT | `/spare-parts/{stockId}/equipment-bom/{bomId}` | No statically resolved reference |
| SparePartController | POST | `/spare-parts/{stockId}/stock-in` | [tests/spare-parts/inventory.spec.ts:9](../tests/spare-parts/inventory.spec.ts#L9), [tests/spare-parts/inventory.spec.ts:19](../tests/spare-parts/inventory.spec.ts#L19) |
| SparePartController | GET | `/spare-parts/{stockId}/transactions` | [tests/spare-parts/inventory.spec.ts:17](../tests/spare-parts/inventory.spec.ts#L17) |
| SparePartController | POST | `/spare-parts/{stockId}/transfer` | No statically resolved reference |
| SparePartController | POST | `/spare-parts/import` | No statically resolved reference |
| SparePartController | POST | `/spare-parts/search` | No statically resolved reference |
| SparePartController | GET | `/spare-parts/site/{siteId}` | No statically resolved reference |
| SparePartReorderController | GET | `/spare-part-reorders` | [tests/spare-parts/spare-workflow.spec.ts:68](../tests/spare-parts/spare-workflow.spec.ts#L68) |
| SparePartReorderController | POST | `/spare-part-reorders` | No statically resolved reference |
| SparePartReorderController | PUT | `/spare-part-reorders/{id}` | [tests/spare-parts/spare-workflow.spec.ts:64](../tests/spare-parts/spare-workflow.spec.ts#L64) |
| SparePartReorderController | POST | `/spare-part-reorders/{id}/receive-stock` | [tests/spare-parts/spare-workflow.spec.ts:63](../tests/spare-parts/spare-workflow.spec.ts#L63), [tests/spare-parts/spare-workflow.spec.ts:65](../tests/spare-parts/spare-workflow.spec.ts#L65) |
| SpareRequestController | POST | `/assignments/{assignmentId}/spare-requests` | [tests/spare-parts/spare-workflow.spec.ts:9](../tests/spare-parts/spare-workflow.spec.ts#L9), [tests/spare-parts/spare-workflow.spec.ts:11](../tests/spare-parts/spare-workflow.spec.ts#L11), [tests/spare-parts/spare-workflow.spec.ts:48](../tests/spare-parts/spare-workflow.spec.ts#L48), [tests/spare-parts/spare-workflow.spec.ts:57](../tests/spare-parts/spare-workflow.spec.ts#L57) |
| SpareRequestController | GET | `/spare-requests` | No statically resolved reference |
| SpareRequestController | GET | `/spare-requests/{id}` | [tests/spare-parts/spare-workflow.spec.ts:28](../tests/spare-parts/spare-workflow.spec.ts#L28), [tests/spare-parts/spare-workflow.spec.ts:66](../tests/spare-parts/spare-workflow.spec.ts#L66) |
| SpareRequestController | POST | `/spare-requests/{id}/check-stock` | [tests/spare-parts/spare-workflow.spec.ts:15](../tests/spare-parts/spare-workflow.spec.ts#L15), [tests/spare-parts/spare-workflow.spec.ts:40](../tests/spare-parts/spare-workflow.spec.ts#L40), [tests/spare-parts/spare-workflow.spec.ts:59](../tests/spare-parts/spare-workflow.spec.ts#L59) |
| SpareRequestController | POST | `/spare-requests/{id}/consume-return` | [tests/spare-parts/spare-workflow.spec.ts:22](../tests/spare-parts/spare-workflow.spec.ts#L22), [tests/spare-parts/spare-workflow.spec.ts:23](../tests/spare-parts/spare-workflow.spec.ts#L23), [tests/spare-parts/spare-workflow.spec.ts:24](../tests/spare-parts/spare-workflow.spec.ts#L24), [tests/spare-parts/spare-workflow.spec.ts:30](../tests/spare-parts/spare-workflow.spec.ts#L30) |
| SpareRequestController | POST | `/spare-requests/{id}/create-purchase-request` | [tests/spare-parts/spare-workflow.spec.ts:60](../tests/spare-parts/spare-workflow.spec.ts#L60) |
| SpareRequestController | POST | `/spare-requests/{id}/issue` | [tests/spare-parts/spare-workflow.spec.ts:12](../tests/spare-parts/spare-workflow.spec.ts#L12), [tests/spare-parts/spare-workflow.spec.ts:21](../tests/spare-parts/spare-workflow.spec.ts#L21), [tests/spare-parts/spare-workflow.spec.ts:46](../tests/spare-parts/spare-workflow.spec.ts#L46) |
| SpareRequestController | POST | `/spare-requests/{id}/manager-approve` | [tests/spare-parts/spare-workflow.spec.ts:13](../tests/spare-parts/spare-workflow.spec.ts#L13), [tests/spare-parts/spare-workflow.spec.ts:14](../tests/spare-parts/spare-workflow.spec.ts#L14), [tests/spare-parts/spare-workflow.spec.ts:39](../tests/spare-parts/spare-workflow.spec.ts#L39), [tests/spare-parts/spare-workflow.spec.ts:51](../tests/spare-parts/spare-workflow.spec.ts#L51), [tests/spare-parts/spare-workflow.spec.ts:58](../tests/spare-parts/spare-workflow.spec.ts#L58) |
| SpareRequestController | POST | `/spare-requests/{id}/manager-reject` | [tests/spare-parts/spare-workflow.spec.ts:50](../tests/spare-parts/spare-workflow.spec.ts#L50) |
| SpareRequestController | POST | `/spare-requests/{id}/reserve` | [tests/spare-parts/spare-workflow.spec.ts:16](../tests/spare-parts/spare-workflow.spec.ts#L16), [tests/spare-parts/spare-workflow.spec.ts:20](../tests/spare-parts/spare-workflow.spec.ts#L20), [tests/spare-parts/spare-workflow.spec.ts:41](../tests/spare-parts/spare-workflow.spec.ts#L41) |
| SystemTimeController | GET | `/system/time` | [tests/regression/date-time-and-validation.spec.ts:5](../tests/regression/date-time-and-validation.spec.ts#L5) |
| UserController | GET | `/users` | No statically resolved reference |
| UserController | POST | `/users` | No statically resolved reference |
| UserController | GET | `/users/{id}` | No statically resolved reference |
| UserController | PUT | `/users/{id}` | No statically resolved reference |
| UserController | GET | `/users/username/{username}` | No statically resolved reference |
| UserRoleAssignmentController | GET | `/admin/users/{userId}/roles` | No statically resolved reference |
| UserRoleAssignmentController | PUT | `/admin/users/{userId}/roles` | [tests/auth/account-lifecycle.spec.ts:49](../tests/auth/account-lifecycle.spec.ts#L49) |
| VendorAmcController | POST | `/vendor-amc` | [tests/vendor-amc/vendor-amc.spec.ts:11](../tests/vendor-amc/vendor-amc.spec.ts#L11), [tests/vendor-amc/vendor-amc.spec.ts:20](../tests/vendor-amc/vendor-amc.spec.ts#L20) |
| VendorAmcController | DELETE | `/vendor-amc/{id}` | [tests/vendor-amc/vendor-amc.spec.ts:12](../tests/vendor-amc/vendor-amc.spec.ts#L12), [tests/vendor-amc/vendor-amc.spec.ts:25](../tests/vendor-amc/vendor-amc.spec.ts#L25) |
| VendorAmcController | GET | `/vendor-amc/{id}` | [tests/vendor-amc/vendor-amc.spec.ts:28](../tests/vendor-amc/vendor-amc.spec.ts#L28) |
| VendorAmcController | PUT | `/vendor-amc/{id}` | No statically resolved reference |
| VendorAmcController | GET | `/vendor-amc/{id}/equipment` | [tests/vendor-amc/vendor-amc.spec.ts:19](../tests/vendor-amc/vendor-amc.spec.ts#L19), [tests/vendor-amc/vendor-amc.spec.ts:32](../tests/vendor-amc/vendor-amc.spec.ts#L32) |
| VendorAmcController | POST | `/vendor-amc/{id}/equipment` | [tests/vendor-amc/vendor-amc.spec.ts:13](../tests/vendor-amc/vendor-amc.spec.ts#L13) |
| VendorAmcController | DELETE | `/vendor-amc/{id}/equipment/{equipmentId}` | [tests/vendor-amc/vendor-amc.spec.ts:18](../tests/vendor-amc/vendor-amc.spec.ts#L18) |
| VendorAmcController | GET | `/vendor-amc/{id}/pm-schedules` | No statically resolved reference |
| VendorAmcController | POST | `/vendor-amc/{id}/renew` | [tests/vendor-amc/vendor-amc.spec.ts:22](../tests/vendor-amc/vendor-amc.spec.ts#L22) |
| VendorAmcController | GET | `/vendor-amc/dashboard` | No statically resolved reference |
| VendorAmcController | POST | `/vendor-amc/search` | No statically resolved reference |
| VendorController | GET | `/vendors` | No statically resolved reference |
| VendorController | POST | `/vendors` | No statically resolved reference |
| VendorController | DELETE | `/vendors/{id}` | No statically resolved reference |
| VendorController | GET | `/vendors/{id}` | No statically resolved reference |
| VendorController | PUT | `/vendors/{id}` | [tests/integration/master-data-lifecycles.spec.ts:12](../tests/integration/master-data-lifecycles.spec.ts#L12) |
| VendorController | GET | `/vendors/{vendorId}/amc-contracts` | No statically resolved reference |
| VendorController | POST | `/vendors/search` | No statically resolved reference |

Controller operations: 214. Operations with direct method/path references: 114. Without a resolved direct reference: 100.
