# Automation coverage audit and implementation plan

Audit date: 2026-11-26. Scope: the implemented CMMS application, existing Playwright suite, backend tests, frontend utility tests and CI. The data generators and k6 suite serve different purposes and do not establish functional coverage.

## Finding

The existing automation does **not** cover every application scenario. The initial suite had 88 discovered cases, many of which were route smoke checks or parameterized API searches. Two security tests depended on optional credentials and could silently skip. The old endpoint report matched substrings without HTTP methods, so a GET could make writes appear covered. Several matrix entries named test files that did not exist. The AMC test mentioned renewal without executing renewal. Frontend `npm test` omitted the existing checklist-selection tests.

## Implemented work

| Priority | Work | Acceptance evidence |
|---|---|---|
| P0 | Reuse API client, factories and cleanup; add disposable site-scoped roles/accounts | `fixtures/accounts.ts`; real login and no optional viewer/site credentials |
| P0 | Read allowed/write denied, cross-site direct ID/list/search and hostile site filter | `tests/security/rbac.spec.ts`, `cross-site-security.spec.ts` |
| P0 | Password mismatch, wrong current password, old-password rejection, disabled login/refresh | `tests/auth/account-lifecycle.spec.ts` |
| P0 | Permission and user-role removal affects an already-issued session | `tests/auth/account-lifecycle.spec.ts` |
| P1 | BOM CRUD, duplicate, negative quantity and wrong-site links | `tests/equipment/spare-bom.spec.ts` |
| P1 | Checklist completion/proof prerequisites, persisted response, file round trip and wrong-parent IDs | `tests/assignment/checklist-execution.spec.ts` |
| P1 | Work-log time validation, edits, attachment round trip/deletion and wrong-parent access | `tests/assignment/work-log-attachments.spec.ts` |
| P1 | My Assignments cannot impersonate a different technician; linked profile identity | `tests/assignment/my-assignments.spec.ts` |
| P1 | Spare manager approval/rejection, reserve, issue, partial consumption, return, cancellation | `tests/spare-parts/spare-workflow.spec.ts`; assert stock, reservation and cost totals |
| P1 | Stock shortage, linked purchase, invalid receipt and valid receipt | `tests/spare-parts/spare-workflow.spec.ts`; assert linked request and inventory |
| P1 | Approve/reject with a real approver, replay denial and persisted request/history | `tests/configuration/approval-and-notifications.spec.ts` |
| P1 | Notification recipient ownership, read/archive and settings validation/restoration | `tests/configuration/approval-and-notifications.spec.ts` |
| P1 | Current company update/restoration, duplicate code and invalid input | `tests/configuration/company.spec.ts` |
| P1 | AMC renewal linkage and preservation of old dates/equipment mappings | `tests/vendor-amc/vendor-amc.spec.ts` |
| P1 | PM generation advances/persists successive due dates | `tests/preventive-maintenance/schedule.spec.ts`; replaces the old permissive 200/400/409 assertion, which did not prove idempotency |
| P1 | Deterministic report costs, grouping, request/assignment history, dashboard count and report isolation | `tests/report/deterministic-reports.spec.ts` |
| P1 | UI create/list/view/edit/save, no list edit action, view-only account and edit-route denial | `tests/ui/site-navigation.spec.ts` |
| P0 | Run configuration mutation suites separately after ordinary tests | `configuration` Playwright project, one worker; restore settings through cleanup |
| P0 | Accurate static endpoint reference inventory; tool regression tests | `tools/generate-coverage.mjs`, `tools/generate-coverage.test.mjs` |
| P0 | Typecheck, inventory-tool checks and all frontend utility tests in CI | package scripts and `.github/workflows/e2e-tests.yml` |

## Execution and data isolation

1. Use a dedicated PostgreSQL database, run normal Liquibase migrations, seed the administrator and configure a private password.
2. Start the backend with `--cmms.approval.enabled=true`. Default approval configurations remain disabled except during the isolated approval tests.
3. Set `E2E_TEST_DATABASE_NAME`, `CMMS_API_BASE_URL`, `CMMS_UI_BASE_URL` and credentials in the ignored `.env`. The database name guard is an acknowledgement, not remote verification of the backend's JDBC target; the operator/CI must bind that backend to the named database.
4. Run `npm run typecheck`, `npm run test:tools`, `npm run docs:coverage`, then `npm run test:e2e` from `e2e`. Inspect skipped/failed tests and cleanup attachments, not just the exit code.
5. API cleanup deactivates masters/accounts. Issued spare lines, purchase records and approval history are intentional audit records with no deletion API. Retain them only in the disposable database; CI discards its database at job end.
6. Run backend tests and frontend tests/build. Record results separately from the static coverage inventory.

## Remaining coverage plan

No finite suite proves every input and role combination. These are explicit remaining work items, not implied coverage:

| Priority | Remaining scenario families | Implementation/acceptance plan |
|---|---|---|
| P1 | Every feature's UI create/edit validation and view aliases | Expand the site interaction pattern to each module; assert writes and persisted values, not only visible body text |
| P1 | Concurrent stock issue/receipt, reorder replay and simultaneous PM generation | Add independent sessions and transaction-level assertions for no duplicate stock or work orders; preserve failing tests for confirmed defects |
| P1 | PM/request checklist propagation and immutable inherited steps across all request variants | Extend existing backend checklist tests with API propagation fixtures and duplicate-prevention assertions |
| P1 | Multiple approvers, requester self-approval, wrong approver role/site and disabled approver | Parameterize the isolated approval project with two real accounts and minimum approval count 2 |
| P1 | Transfer/import, invalid files/oversize uploads and all attachment ownership paths | Extend inventory and upload suites with fixture files and stock conservation/ownership assertions |
| P2 | All report aggregates and dashboard widgets over boundary dates/empty sites | Add exact downtime/PM/stock/vendor datasets and assertions for each total and filter |
| P2 | Accessibility, mobile layout, Firefox/WebKit | Add browser projects and accessibility assertions with agreed supported-device matrix |
| Integration | SMTP/SMS delivery and disconnect/reconnect notification streams | Use a test mail/SMS provider; verify delivery and reconnect without contacting real recipients |
| Performance | Sustained load, resource exhaustion and scheduler timing | Run existing k6 profiles against a disposable dataset with agreed latency/error thresholds; use fixed clocks for schedule boundaries |

The API inventory lists every discovered controller operation and the actual source references. A reference is not a passing test, nor proof of positive/negative/permission coverage. Runtime evidence is the Playwright HTML/JUnit report.

## Validation recorded on 2026-11-26

- Final full Playwright run: **106 passed, 0 failed, 0 skipped**, one worker, real Chromium and a newly migrated isolated PostgreSQL database. Initial inventory was 88 cases; 18 cases were added and existing scenarios strengthened.
- Viewer/site UI cases: three consecutive repetitions passed after replacing in-page account switching with a fresh authenticated browser context. An intermediate parallel run exposed that test race and two timeouts; the final full run used one worker on this shared machine.
- Backend `mvn test`: **46 passed, 1 skipped**, including both notification migration tests against disposable schemas. The skipped checklist migration test requires its separate database role and historical baseline resources.
- Frontend `npm test`: **28 passed**; `npm run build` succeeded with the existing large-chunk warning.
- E2E TypeScript check passed; **4 coverage-tool tests passed**; `git diff --check` passed.
- API inventory: 214 controller operations, 114 with statically resolved method/path references. This is **not** a coverage percentage.
- Graphify refreshed locally. HTML/JUnit reports and logs are under ignored `e2e/playwright-report/` and `e2e/reports/`. The temporary test servers used 6101/6201; the existing application servers were left running.
