> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 11. Assignment Checklist Add/Edit/Proof Upload

**Location:** Assignment edit/view → Checklist tab  
**Permissions:** `ASSIGNMENT_CHECKLIST_VIEW`, `ASSIGNMENT_CHECKLIST_UPDATE`; the UI refers to proof-specific permission names, while CSV maps proof upload/delete under `ASSIGNMENT_CHECKLIST_UPDATE`—see inconsistencies.

| Field | Mapping | Required | Purpose/validation |
|---|---|---:|---|
| Task | `taskTitle` → checklist entity `task_title` | Required for meaningful row | Work step, e.g. `Inspect DC terminal torque`. |
| Instructions | `instructions` → `instructions` | No | Execution guidance. |
| Response Type | `responseType` → `response_type` | Default checkbox | `CHECKBOX`, `TEXT`, `NUMBER`, `PHOTO`. |
| Required | `required` → `required` | Boolean | Required steps can block assignment completion. |
| Proof Required | `proofRequired` → `proof_required` | Boolean | Requires file before completion when configuration enables it. |
| Status | row `status` | Yes during execution | `PENDING`, `COMPLETED`, `NOT_APPLICABLE`. |
| Reading/Response | `responseValue` → `response_value` | Conditional | Numeric/text/check response. |
| Remarks | `remarks` → `remarks` | No | Technician evidence/context. |
| Proof File | multipart file → checklist proof table | Conditional | Photo/PDF evidence; content type and 10 MB configured maximum. |

APIs: GET/POST `/api/maintenance/assignments/{assignmentId}/checklist`; PUT/DELETE row path; POST/DELETE proof paths. PM-generated assignments copy checklist template items, which cannot be deleted like manually added rows. Required/proof rules are enforced before completion.

