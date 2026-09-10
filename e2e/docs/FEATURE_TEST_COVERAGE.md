# Feature Test Coverage

Status reflects executable tests against the current source. Endpoint detail is in `API_TEST_COVERAGE.md`.

| Feature | Implemented behavior | Automation status |
|---|---|---|
| Startup | frontend, health, database-backed APIs, public time | Covered by global setup and smoke |
| Authentication | JWT login/refresh, bad and empty credentials, protected routes, logout state | Covered |
| Authorization | deny-unmapped CSV policy and anonymous rejection | All operations inventoried; non-admin matrix needs configured accounts |
| Site isolation | site-aware services and cross-site relationship validation | FK attack covered; scoped-user direct-ID scenario conditional on account |
| Company | singleton company and logo | UI/contract covered; singleton mutation not run |
| Sites | CRUD, duplicate validation, search/paging/sort | Covered |
| Employees | create/update/site assignment/email validation/search | Covered |
| Users | current-user access and management UI/API contracts | Partial; disable/re-auth needs seeded user accounts |
| Roles/permissions | role CRUD, permission persistence, duplicate validation, catalogs | Covered; viewer enforcement conditional on account |
| Equipment | CRUD relationship, search, summaries and health routes | Covered |
| Equipment documents | upload, metadata, download, invalid type and cleanup | Covered |
| Equipment BOM | routes/UI/authorization contract | Partial |
| Maintenance requests | create, transitions, search, related records, invalid/cancelled state | Covered |
| Approval workflow | configuration, pending/history, approve/reject | Pending/history UI/routes covered; cross-user actions environment-dependent |
| Assignments/My Assignments | create/start/complete/search/request sync and identity-search route | Covered; impersonation attack needs technician accounts |
| Checklist | CRUD/proof routes | Contract/security only |
| Work logs | create/list/completion and completion prerequisite | Covered |
| Downtime | full status sequence, RCA, duration and invalid transition | Covered |
| Spare parts | stock-in, absolute adjustment, ledger and invalid quantity | Covered |
| Spare usage/reorders | reserve/issue/consume/return/purchase workflow | Contract/UI only |
| Preventive maintenance | schedule CRUD, due date, generation and duplicate behavior | Covered |
| Vendors/AMC | vendor lifecycle, contract validation and equipment mapping | Covered |
| Notifications/settings | list/count/read-all plus settings UI/contracts | Inbox covered; recipient/settings toggle partial |
| Reports | all six report APIs and three pages | Covered for success/paging; aggregation fixture partial |
| Dashboard | summary/overview/widgets plus UI | Covered for contracts; deterministic count deltas partial |
| Pagination/search/sort | thirteen search APIs, including identity-controlled Pending Approvals and My Assignments; hostile values and invalid sort | Covered |
| Date/time | UTC `Z`, drift, zone metadata and timezone-less rejection | Covered |
| UI integration | 41 routes; browser exceptions and API 4xx/5xx captured | Covered; PM calendar defect found |

## Environment prerequisites

| Feature | Why incomplete in this run | Recommended validation |
|---|---|---|
| Cross-user RBAC/site attacks | only SUPER_ADMIN credentials were available | seed viewer, technician, manager, SITE-A and SITE-B users and set documented variables |
| Real SMTP/SMS | no sandbox provider | use a provider sandbox and delivery telemetry |
| Daily schedulers | production cron waits are nondeterministic | invoke guarded APIs and retain fixed-clock unit tests |
| Sustained load | separate from regression | run existing k6 profiles after smoke |
