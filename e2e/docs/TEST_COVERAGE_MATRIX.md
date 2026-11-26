# CMMS scenario coverage matrix

The earlier matrix contained planned test paths presented as implementations. Use [Feature Test Coverage](FEATURE_TEST_COVERAGE.md) for the corrected module-to-executable-file mapping and [Automation Plan](AUTOMATION_PLAN.md) for acceptance criteria, priorities and remaining scenarios.

| Coverage layer | Source of evidence | What it establishes |
|---|---|---|
| Business/API regression | tests/auth, assignment, configuration, downtime, equipment, integration, preventive-maintenance, report, site, spare-parts, vendor-amc, workflow | Persisted values, transitions and selected negative cases |
| Authorization | tests/security and tagged account/approval/identity cases | Real account permission and site boundaries for the tested actions |
| Browser interaction | tests/ui/site-navigation.spec.ts and tests/auth/authentication.spec.ts | User actions and permission-controlled navigation |
| Browser smoke | tests/ui/all-module-routes.spec.ts, tests/smoke | Route loading and observed failures; no claim of form completeness |
| Contract inventory | tests/api, docs/API_TEST_COVERAGE.md | API contracts, permission mapping and source references; not scenario coverage |
| Backend unit/integration | cmms_back_end/src/test | Security, checklist, time and environment-dependent migration checks |
| Frontend unit | cmms_front_end/src/shared/utils/*.test.mjs | Time, dropdowns, checklist selection, error and permission utility behavior |
| Load/data generation | performance-tests, test-data-automation, performance-data-generator | Separate data/load workflows; not functional regression evidence |

For runtime status, inspect the latest Playwright HTML report, JUnit XML, skipped tests and cleanup attachments. No claim of exhaustive application coverage is made.
