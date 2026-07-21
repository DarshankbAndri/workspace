> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 4. Role Create/Edit and Permission Assignment

**Navigation:** Administration → Roles → Add Role  
**Routes:** `/admin/roles/new`, `/admin/roles/{id}/edit`; view has a separate read-only page.  
**Permissions:** `ROLE_VIEW`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`; permission catalogue uses `PERMISSION_VIEW` APIs where mapped.

Roles group permissions that control frontend routes/buttons and backend API authorization.

| Field | Mapping | UI/Required | Purpose / example | Validation/source/edit |
|---|---|---|---|---|
| Role Code | `roleCode` → same → role table `role_code` | Text; mandatory | Stable machine code, e.g. `SOLAR_TECHNICIAN`. | Required; normalized/unique by backend. Changing a used code can affect configuration references. |
| Role Name | `roleName` → same → `role_name` | Text; mandatory | Display name, e.g. `Solar Technician`. | Required. |
| Description | `description` → same → `description` | Text; optional | Explains intended responsibility. | Free text. |
| Status | `status` → same → `status` | Dropdown; mandatory | Activates/inactivates role. | Static `ACTIVE`/`INACTIVE`. |
| Permissions | `permissionIds[]` → role-permission join table | Grouped checkboxes; optional | Grants page/action/API abilities. | Loaded from `GET /api/admin/permissions`; searchable and grouped. Existing selections load from role detail. |

Save: `POST /api/admin/roles`; update: `PUT /api/admin/roles/{id}`; cancel/success returns to `/admin/roles`. Role changes affect users assigned that role and cached API-permission evaluation; backend change flows should clear relevant cache as implemented.

**Tip:** Grant the smallest permission set and include helper API permissions required by a page. **Mistake:** granting only a route permission while omitting dropdown/helper API access.

