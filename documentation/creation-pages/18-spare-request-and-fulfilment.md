> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 18. Spare Request, Approval, Store Fulfilment, Consumption, and Return

### Request

**Location:** Assignment edit → Spare Parts tab  
**Permissions:** `SPARE_USAGE_VIEW`, `SPARE_USAGE_CREATE`, `SPARE_USAGE_UPDATE`, `SPARE_USAGE_DELETE`.

| Field | Mapping | Required | Source/use |
|---|---|---:|---|
| Spare Part | `stockId` → site stock FK | Yes by backend | Site stock API, filtered to assignment site; equipment BOM recommendations may be loaded. |
| Quantity / Requested Quantity | `quantityUsed` | Positive | Requested amount. One part/site-stock row per assignment due to unique constraint. |
| Remarks | `remarks` | Optional | Need/reason/instructions. |

POST `/api/maintenance/assignments/{id}/spares` (or `/api/assignments/{id}/spare-requests` in the store-oriented flow). Initial status `REQUESTED`.

### Manager approval

**Route:** `/inventory/spare-approvals`; permission `SPARE_USAGE_MANAGER_APPROVE`. Fields: Approved Qty (positive, cannot exceed business limits enforced by service) and Remarks. POST manager approve/reject endpoints.

### Store processing

**Route:** `/inventory/spare-requests`. Actions and permissions:

- Check stock: `SPARE_USAGE_STORE_PROCESS`.
- Reserve: `SPARE_USAGE_RESERVE`.
- Issue: `SPARE_USAGE_ISSUE`.
- Create purchase request when unavailable: `REORDER_CREATE`.
- Consume/return: `SPARE_USAGE_CONSUME`.

Consume/return fields are Issued Qty (read-only), Consumed Qty, Returned Qty, and Remarks. Consumed plus returned cannot exceed issued; returns restore stock and consumption sets material cost.

```text
REQUESTED → MANAGER_APPROVED → STORE_REVIEW
  → STOCK_AVAILABLE → RESERVED → ISSUED → CONSUMED/RETURNED
  → STOCK_NOT_AVAILABLE → PURCHASE_REQUESTED → PURCHASE_RECEIVED → reserve/issue
```

Main table: `maintenance_spare_usage`; links assignment, stock, part, users performing each action, timestamps, quantities, costs, and reorder reference.

