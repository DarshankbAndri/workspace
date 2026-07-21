> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).

## 1. Company Profile Create/Edit

### Purpose, users, and timing

**Navigation:** Administration → Company  
**Route:** `/admin/company`  
**Users:** Company administrators with `COMPANY_VIEW`; saving requires `COMPANY_CREATE` for the first record or `COMPANY_UPDATE` afterward.  
**Use when:** initially configuring the tenant/company or changing its business identity and branding. Company name and logo are returned by the company APIs and used by application branding; report-specific use depends on each report implementation.

**Prerequisites:** Authenticated administrator. No company dropdown or multi-company selector exists on this page.

### Fields

| Field | Technical mapping | UI/Required | Purpose and usage | Solar example | Validation / source / edit behavior |
|---|---|---|---|---|---|
| Company Code | `companyCode` → `companyCode` → `company_master.company_code` | Text; mandatory | Stable business code used to identify the company record. | `SUNOPS` | UI rejects blank; backend DTO is not blank; persisted code is unique. Editable when user can persist. |
| Company Name | `companyName` → `companyName` → `company_master.company_name` | Text; mandatory | Display/legal name used in company profile and branding. | `Sunrise Solar Operations Pvt Ltd` | UI rejects blank; backend not blank. |
| Email | `email` → `email` → `company_master.email` | Email; optional | General company contact. | `operations@sunrise.example` | Browser email control plus backend email validation where configured. |
| Phone Number | `phoneNumber` → `phoneNumber` → `company_master.phone_number` | Text; optional | Company contact number. | `+91 98765 43210` | No strict UI pattern; backend length applies. |
| Status | `status` → `status` → `company_master.status` | Dropdown; optional | Enables/inactivates the company profile. | `ACTIVE` | Static options `ACTIVE`, `INACTIVE`; defaults to `ACTIVE`. |
| Address | `address` → `address` → `company_master.address` | Text area; optional | Registered/operational address used as company reference data. | `Solar Park Road, Jaisalmer, Rajasthan` | Free text. |
| Upload Logo | multipart `file` → stored logo metadata/path | File; optional | Replaces branding image. | `sunrise-logo.png` | Sent after company save to `/api/company/upload-logo`; file rules come from backend multipart/allowed-content implementation. Existing preview remains until replaced. |

### Save, edit, cancel, APIs, and database

- Save calls `POST /api/company/create`; update calls `PUT /api/company/update/{id}`; logo upload follows with `POST /api/company/upload-logo`.
- The page remains on the company profile and reloads the saved response. Users without create/update permission see disabled fields.
- There is no destructive company delete action in the current UI/mapping.
- Main table: `company_master`; audit/status columns are defined in its Liquibase/entity mapping.

**Tips:** Use a stable short code and a landscape/transparent logo.  
**Common errors:** blank code/name, invalid image, or `COMPANY_VIEW` without the appropriate save permission.

