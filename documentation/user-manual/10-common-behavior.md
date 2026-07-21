> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 10. Common List, View, and Form Behavior

### Lists and views

- Search and filters narrow data; clear them before assuming a record is missing.
- Pagination loads another result page. Sorting support depends on the current grid/column.
- Click a row or **View** icon to open details. Select **Edit** only when the button is visible and the record state permits it.
- Create, edit, delete, approve, issue, consume, return, and special buttons are independently permission-controlled.
- Loading indicators mean the request is in progress. An empty state means no matching accessible rows. An error banner means the API failed or access was denied.
- Delete may inactivate or soft-delete master data; it should not be used for historical transactions.

### Forms

1. Complete fields marked required. Type in autocomplete fields and choose an offered record.
2. Observe dependent fields: site selection often controls equipment, vendor, employee, stock, and maintenance options.
3. Select **Save/Submit** once. Validation messages identify missing or invalid data.
4. On success, the application normally shows a message and returns to the list or refreshes the saved view.
5. **Cancel** discards current edits. There is no guaranteed unsaved-changes confirmation on every page.

Disabled fields may be system-controlled, state-controlled, or read-only due to permission. Upload only business-safe files of accepted type/size. Do not use browser Back during an active save.

