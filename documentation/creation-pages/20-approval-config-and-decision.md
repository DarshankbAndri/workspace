> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 20. Approval Configuration and Approval Decisions

### Approval configuration

**Route:** `/admin/approval-config`  
**Permissions:** `APPROVAL_CONFIG_VIEW`, `APPROVAL_CONFIG_UPDATE`.

| Field | Mapping | Required | Source/use |
|---|---|---:|---|
| Module | `moduleCode` | Read-only in edit | Business module/action owner. Existing rows provide value. |
| Action | `actionCode` | Read-only in edit | Operation requiring approval. |
| Approval Required | `approvalRequired` | Switch | Enables workflow interception. |
| Approver Role | `approverRoleCode` | Conditional | Roles API; recipients must hold role/scope. |
| Minimum Approval Count | `minApprovalCount` | Minimum 1 | Number of approvals needed. |
| Status | `status` | Default active | Active/inactive config. |

GET/POST `/api/admin/approval-config`; PUT row path. The current dialog primarily edits seeded rows; create support exists in service but UI entry begins from a selected row.

### Approve/reject

**Route:** `/approvals/pending`; permissions `APPROVAL_VIEW`, `APPROVAL_APPROVE`, `APPROVAL_REJECT`. Decision form contains Comments; submit uses POST `/api/approvals/{id}/approve` or `/reject`. Approval result invokes the registered business transition. History is read-only/searchable.

