> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 19. Reorder/Purchase Request Create, Edit, and Receipt

**Navigation:** Inventory → Reorders; creation is also available from the spare list or stock-shortage flow.  
**Permissions:** `REORDER_VIEW`, `REORDER_CREATE`, `REORDER_UPDATE`.

| Field | Mapping | Required | Purpose/validation |
|---|---|---:|---|
| Stock/Part/Site | derived from selected stock | System | Links purchase need to exact site inventory. |
| Requested Quantity | `requestedQuantity` → reorder table column | Positive mandatory | Quantity to source. |
| Estimated Unit Cost | `estimatedUnitCost` → matching column | Non-negative | Defaults to stock unit cost. |
| Estimated Total Cost | calculated | Read-only | Quantity × estimated unit cost. |
| Vendor | `vendorId` → vendor FK | Optional | Preferred/selected vendor must be assigned to site. Creation dialog currently defaults through service and does not expose vendor selection. |
| Expected Date | `expectedDate` → matching column | Optional | Planned arrival. |
| Status | `status` → status column | Default/request edit | Current reorder lifecycle; edit dialog exposes service-supported statuses. |
| Remarks | `remarks` | Optional | Purchase justification/context. |

Create: `POST /api/spare-part-reorders`; edit: `PUT /api/spare-part-reorders/{id}`. Receipt dialog captures Received Quantity, Unit Cost, and Remarks and calls `POST /api/spare-part-reorders/{id}/receive-stock`, which posts stock-in and marks the request received.

**Current limitation:** any positive receipt marks the entire reorder `RECEIVED`; partial/multiple receiving is not modeled.

