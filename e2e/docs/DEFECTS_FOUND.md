# Application Defects Found

## BUG-E2E-001 — Dormant frontend helpers have no backend contract

Module: Shared frontend API  
Severity: Low  
Test: `tests/api/api-contract.spec.ts`  
Precondition: current frontend source and rebuilt OpenAPI  
Steps: compare every discovered Axios operation with live OpenAPI.  
Expected: declared helpers map to backend routes.  
Actual: nine `/claims/**` operations and `/documents/upload/{entryType}/{entryId}` have neither callers nor backend routes.  
API: `/claims/**`, `/documents/upload/{entryType}/{entryId}`  
Relevant frontend file: `cmms_front_end/src/shared/services/api.js`  
Relevant backend file: none  
Evidence: `reports/api-contract.json` and HTML report  
Suggested root cause: dead helpers from an earlier application; remove after confirming no external consumer, or restore the complete feature.

## BUG-E2E-002 — PM calendar sends empty required dates

Module: Preventive maintenance calendar  
Severity: High  
Test: `tests/ui/all-module-routes.spec.ts` (`/maintenance/preventive/calendar`)  
Precondition: authenticated SUPER_ADMIN on a fresh schema  
Steps: navigate to the calendar and monitor API responses.  
Expected: valid `startDate` and `endDate`, HTTP 200.  
Actual: `GET /api/preventive-maintenance/calendar?startDate=&endDate=` returns HTTP 400.  
Relevant frontend file: `cmms_front_end/src/features/preventiveMaintenance/pages/PreventiveMaintenanceCalendarPage.jsx`  
Relevant backend file: `cmms_back_end/src/main/java/com/example/cmmsApplication/preventivemaintenance/controller/PreventiveMaintenanceCalendarController.java`  
Screenshot/trace: `test-results/ui-all-module-routes-*/` and HTML report  
Suggested root cause: initial calendar bounds are empty before synchronized business dates are ready.

## Resolved deployment discrepancy

The old 17:06 JAR returned 404 for `POST /approvals/pending/search` and `POST /maintenance/assignments/my/search`. Current source contained both mappings. After rebuilding and restarting, both smoke tests returned 200. This was stale runtime state, not a current-source defect.

## Repository discrepancy

The request names `main_v1`; the supplied working tree is on `darsh/date_time_central` at `f64cba8`. Active work was present, so no branch switch or history rewrite was performed.
