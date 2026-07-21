> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 12. Technician Work Log Create/Edit and Attachment Upload

**Location:** Assignment edit/view → Work Logs tab  
**Permissions:** `ASSIGNMENT_WORK_LOG_VIEW`, `ASSIGNMENT_WORK_LOG_CREATE`, `ASSIGNMENT_WORK_LOG_UPDATE`, `ASSIGNMENT_WORK_LOG_DELETE`.

| Field | Mapping | UI/Required | Purpose/example | Validation/source |
|---|---|---|---|---|
| Technician | `technicianEmployeeId` → `technician_employee_id` | Dropdown; mandatory | Person performing work. | Active employees from assignment site. |
| Start Time | `startTime` → `start_time` | Date-time; mandatory | Work start. | Required. |
| End Time | `endTime` → `end_time` | Date-time; optional | Work finish. | Must not precede start. |
| Status | `completionStatus` → `completion_status` | Dropdown | `IN_PROGRESS`, `COMPLETED`, `FOLLOW_UP_REQUIRED`, `CANCELLED`. | Defaults in progress. |
| Work Notes | `workNotes` → `work_notes` | Text; optional | Activity summary. | Free text. |
| Issue Found | `issueFound` → `issue_found` | Text; optional | Diagnosis, e.g. `Cooling fan bearing seized`. | Free text. |
| Action Taken | `actionTaken` → `action_taken` | Text; optional | Repair performed. | Free text. |
| Attachment | multipart file → work-log attachment table | Optional | Photo/report evidence. | Backend file limits/content validation. |

APIs: POST `/api/maintenance/assignments/{id}/work-logs`; PUT/DELETE row paths; POST/DELETE attachment paths; GET/download operations require view authorization. Completion progress appears on the assignment.

