> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 14. Downtime RCA Action Add/Edit

**Location:** Downtime view → RCA Actions  
**Permission:** `DOWNTIME_RCA_MANAGE`; unavailable after closed/cancelled.

| Field | Mapping | Required | Purpose/validation |
|---|---|---:|---|
| Action Type | `actionType` → RCA action column | No/default | Corrective/preventive action classification from static options. |
| Target Date | `targetDate` → target date column | Optional | Due date for RCA action. |
| Status | `status` → status column | Default | RCA action progress from static options. |
| Action Description | `description` → description column | Mandatory | Specific corrective/preventive action. |

POST `/api/maintenance/downtime/{id}/rca-actions`; PUT row path. Major downtime cannot close without a root cause and at least one RCA action. Timeline/history records transitions and action changes.

