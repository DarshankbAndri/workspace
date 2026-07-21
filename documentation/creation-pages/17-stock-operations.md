> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 17. Stock In, Adjustment, Transfer, and Import

**Location:** Inventory → Spare Parts list action dialogs  
**Permissions:** `STOCK_TRANSACTION_CREATE`; import uses `SPARE_PART_CREATE`; history uses `STOCK_TRANSACTION_VIEW`.

### Stock In / Adjustment fields

| Field | API property | Required | Rules/use |
|---|---|---:|---|
| Quantity to Add / New Stock Quantity | `quantity` | Yes | Stock-in must be positive; adjustment is a non-negative target balance and cannot be below reserved stock. |
| Unit Cost | `unitCost` | Optional | Defaults to current cost; non-negative. Stock-in currently replaces current site cost. |
| Remarks | `remarks` | Optional | Audit explanation. Strongly recommended for adjustment. |

APIs: POST `/api/spare-parts/{stockId}/stock-in` or `/adjust`. Both lock stock, update balance, write before/after transaction, and may trigger low-stock notification.

### Site-to-site transfer fields

| Field | API property | Required | Rules/use |
|---|---|---:|---|
| Target Site | `targetSiteId` | Yes | Site API; excludes source; user needs access to both sites. |
| Quantity | `quantity` | Yes | Positive and cannot exceed available (`current-reserved`). |
| Target Storage Location | `targetStorageLocation` | Optional | Creates/updates destination location. |
| Remarks | `remarks` | Optional | Transfer audit note. |

POST `/api/spare-parts/{sourceStockId}/transfer` immediately writes `TRANSFER_OUT` and `TRANSFER_IN`; there is no dispatch/receipt in-transit workflow.

### Import

Accepts `.xlsx`, `.xls`, or `.csv` at POST `/api/spare-parts/import`; returns created/updated/failed counts and row errors. Import can create opening/adjustment transactions. Use sanitized templates and review site IDs/codes before upload.

