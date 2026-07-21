# Feature Availability Matrix

> Extracted from the source-verified consolidated manual.

### Feature availability matrix

| Module | Feature | Status | Notes |
|---|---|---|---|
| Authentication | Login/logout/session/access denied | Available | Change Password and forced first-login change are partial/not routed |
| Dashboard | Role/site-aware metrics and widgets | Available | Card click-through is not consistently implemented |
| Company/Site | Profile, logo, site CRUD | Available | Site capacity/timezone not implemented |
| Employees | Employee, site, login, role assignment | Available | No Team master |
| Access | Roles and permission catalogue | Available | User Roles editor Partially Available |
| Vendor/AMC | Vendor CRUD, contracts, equipment coverage, renewal | Available | No vendor self-service portal |
| Equipment | CRUD and linked operational context | Available | No separate category/type masters |
| Requests | Create/view/edit and downstream work | Available | State-dependent actions vary |
| Assignments | Assignment, checklist, work log, attachments/spares | Available | Technician acceptance is not a distinct documented feature |
| Downtime | Event lifecycle, RCA, reporting | Available | — |
| PM | Schedule, list, view, calendar | Available | Uses request permissions; meter PM partial |
| Meter/runtime | Backend foundations | Partially Available | No usable frontend route; no SCADA ingestion UI |
| Spares/stock | Master, site stock, movements, transfer | Available | Partial-issue journey incomplete |
| Reorder/purchase request | Reorder, status, receipt | Available | Not a complete procurement/PO/invoice system |
| Approvals | Inbox, decisions, history, config | Available | Config create journey edit-oriented |
| Notifications | Bell/center/read/archive/settings/live stream | Available | Email depends on external SMTP/config |
| Reports | Equipment history, downtime, equipment cost | Available | No export; other requested reports absent |
| Profile | Navbar identity/logout/theme | Partially Available | No dedicated editable profile/change-password route |
| PM spare planning | BOM-based forecast/transfers/purchase suggestions | Not Available | Proposed future feature only |

