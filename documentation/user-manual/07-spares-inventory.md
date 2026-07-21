> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 7. Spare Parts, Inventory, Fulfilment, and Reorders

### Spare master and stock

**Where:** Inventory → Spare Parts · **Permissions:** `SPARE_PART_VIEW/CREATE/UPDATE/DELETE`; transactions use `STOCK_TRANSACTION_VIEW/CREATE`.

Create parts such as IGBT modules, DC fuses, cooling fans, tracker motors, communication cards, MC4 connectors, batteries, or bearings. Maintain part code/name, category, unit, compatible equipment, preferred vendor, minimum/reorder levels, unit cost, status, and site stock information exposed by the page.

The view page provides stock and transaction actions such as receipt, adjustment, transfer, and movement history when permitted. Always choose the correct site and storage location. Available stock is calculated as:

`Available Stock = Current Stock − Reserved Stock`

A reservation prevents the same units being promised twice. An adjustment corrects a verified physical discrepancy; it is not a substitute for receipt, issue, return, or transfer.

### Spare request and fulfilment

**Permissions:** request/usage actions are embedded in maintenance/assignment views; manager page uses `SPARE_USAGE_MANAGER_APPROVE`; store page uses `SPARE_USAGE_STORE_PROCESS`; special actions use `SPARE_USAGE_RESERVE`, `SPARE_USAGE_ISSUE`, `SPARE_USAGE_CONSUME`.

1. Technician requests a part and quantity against the maintenance work, with reason.
2. Manager opens **Spare Approval** and approves or rejects.
3. Store opens **Approved Spare Requests**, checks available stock, then reserves and issues with the relevant permissions.
4. Technician/store records consumption or return from the supported action.
5. Each action updates request status, reservation, and stock movement history.

**Partial issue is Partially Available:** quantity/status fields support fulfilment actions, but a robust multi-lot partial-issue user journey is not fully represented. Do not promise more than available stock. If unavailable, use a transfer when stock exists at another permitted site or create/manage a reorder.

### Reorders and receipts

**Where:** Inventory → Reorder Requests · **Permissions:** `REORDER_VIEW/CREATE/UPDATE`.

Create a reorder for a site/part, requested quantity, expected date, vendor/cost details and notes shown by the dialog. Progress its status and record receipt using the available action; a receipt creates stock movement and raises on-hand quantity. The current feature is a reorder/purchase-request-like workflow, not a complete purchase-order, quotation, invoice, or accounts-payable module.

Inter-site stock transfer is available from stock operations where permitted. Automatic suggested transfers and automatic purchase requests based on upcoming PM/BOM shortages are Not Available.

