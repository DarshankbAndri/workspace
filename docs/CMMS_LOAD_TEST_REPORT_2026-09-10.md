# CMMS Concurrent Load Test Report — 2026-09-10

## Executive result

The smoke and 10-user baseline profiles passed every k6 threshold against the retained production-sized PostgreSQL dataset. The 25-user stage was stopped by the documented safety guard after host CPU remained at 98–100% (99.2% first sample and 98.2% in quiet mode). The 50- and 100-user stages and the 100–300-user stress profile were not run because continuing would have risked destabilizing the shared local machine.

The highest fully validated level in this environment is therefore **10 concurrent active users**. This is not a production capacity ceiling: k6, Vite dev server, Spring Boot, PostgreSQL, and other local processes shared one four-logical-CPU Windows host. A production capacity decision requires the same test from a separate load-generator machine against the production deployment topology.

## Test target

- UI/API entry point: `http://127.0.0.1:6200/api` (the same Vite proxy path used by the browser)
- Backend: port 6100
- Database: `production_cmms_utc_v1`
- Effective business timezone reported by the backend: `Asia/Riyadh`
- Workload: approximately 30% dashboard, 60% paginated searches, and 10% notifications
- Think time: randomized 0.5–2 seconds
- Traffic: authenticated, read-only; no load-test records were created or removed
- Host: Windows, 4 logical processors, 64 GB RAM, approximately 16 GB free during the test

## Dataset verification

| Dataset | Expected | Actual | Result |
| --- | ---: | ---: | --- |
| Sites | 100 | 100 | PASS |
| Employees | 5,000 | 5,000 | PASS |
| Equipment | 50,000 | 50,000 | PASS |
| Maintenance requests | 100,000 | 100,000 | PASS |
| Assignments | 100,000 | 100,000 | PASS |
| Work logs | 500,000 | 500,000 | PASS |
| Downtime | 100,000 | 100,000 | PASS |
| Spare-part transactions | 100,000 | 100,000 | PASS |

Marker retained: `PERF-KEEPLOADUTC2609071302`.

## Completed k6 results

| Profile | VUs | Duration | Requests | Throughput | HTTP errors | App errors | Overall p95 | Overall p99 | Dashboard p95 | Search p95 | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Smoke | 1 | 30 s | 66 | 2.13 req/s | 0% | 0% | 213 ms | 300 ms | 214 ms | 46 ms | PASS |
| Baseline | 10 | 2 min | 2,240 | 18.47 req/s | 0% | 0% | 374 ms | 943 ms | 430 ms | 268 ms | PASS |
| Load | ramp to 25 | stopped at safety limit | partial | partial | not summarized | not summarized | not summarized | not summarized | not summarized | not summarized | ABORTED: sustained CPU >90% |
| Load | 50 and 100 | not entered | — | — | — | — | — | — | — | — | NOT RUN for host safety |
| Stress | 100–300 | not run | — | — | — | — | — | — | — | — | BLOCKED by load-stage saturation |

Thresholds were HTTP and application error rate below 1%, overall p95 below 1 second, overall p99 below 2.5 seconds, dashboard p95 below 2 seconds, and search p95 below 1 second.

## Resource observations

- At 25 VUs, repeated CPU samples were `100,100,100,98,98` (99.2% average).
- A second quiet-mode run produced `100,91,100,100,100` (98.2% average), proving terminal rendering was not the main cause.
- CPU returned to 24% after stopping k6.
- Free memory remained approximately 15.8–16.2 GB; memory exhaustion was not observed.
- Spring Boot working set was approximately 629–639 MB.
- Hikari configuration is maximum 20 connections; after load it reported 0 active, 12 idle, and 0 pending. Peak pool pressure was not captured.
- PostgreSQL database size was 328 MB.
- PostgreSQL reported 2.38 GB of cumulative temporary-file writes and 239 temp files.
- No deadlocks were recorded.

## Database evidence

The highest sequential-read activity was:

| Table | Live rows | Sequential scans | Rows read by sequential scans |
| --- | ---: | ---: | ---: |
| `maintenance_request` | 100,002 | 6,680 | 338,806,349 |
| `maintenance_assignment` | 100,002 | 2,557 | 104,601,875 |
| `equipment_downtime` | 100,001 | 1,200 | 98,500,929 |
| `equipment_master` | 50,010 | 1,851 | 67,362,325 |
| `spare_part_site_stock` | 10,001 | 1,679 | 16,721,662 |

Representative `EXPLAIN (ANALYZE, BUFFERS)` findings:

- Assignment count scanned and joined both 100k-row assignment and request tables; execution time was about 63 ms before application serialization/concurrency overhead.
- Downtime count performed a sequential scan over 100k rows; execution time was about 27 ms.
- A downtime page sorted all 100k rows by `created_at`, used an external merge sort, wrote temporary data, and took about 44 ms even with warm cached blocks.
- The primary list tables do not have indexes supporting their default `createdAt DESC` sort.

Current PostgreSQL values include only about 160 MB `shared_buffers`, 4 MB `work_mem`, 5 GB `effective_cache_size`, `random_page_cost=4`, JIT enabled, and `max_connections=100`.

## Optimization priorities

### P0 — correct the test and runtime topology

1. Run the backend with the `prod` profile. The current default is `dev`, while application and Spring Security logging are both `DEBUG`. Use `SPRING_PROFILES_ACTIVE=prod`, application logging `INFO`, and security logging `WARN` for the next load run.
2. Do not performance-test through Vite's development server for the production capacity number. Serve the built frontend from the intended reverse proxy and run k6 from a separate machine. Also run a direct-backend comparison to separate proxy cost from API/database cost.
3. Enable `pg_stat_statements` in the staging database, reset it immediately before a run, and capture total/mean/p95-equivalent execution evidence after every stage. Without it, cumulative actuator/table counters cannot attribute all cost to one test window.

### P0 — add indexes for actual pagination patterns

Validate with `EXPLAIN ANALYZE` before committing, then add Liquibase-managed indexes matching the server-enforced filters and default sort. Priority candidates are:

- `equipment_downtime (site_id, created_at DESC)` and/or `equipment_downtime (created_at DESC)`
- `maintenance_assignment (created_at DESC)`; for My Assignments, `(assigned_employee_id, created_at DESC)`
- `maintenance_request (site_id, created_at DESC)`
- `equipment_master (site_id, created_at DESC)`
- `preventive_maintenance_schedule (site_id, created_at DESC)`
- `approval_request (site_id, approval_status, requested_at DESC)`

Avoid adding every candidate blindly; compare real query plans and index-write cost first.

### P0 — reduce expensive paginated count queries

Every Spring Data `Page` request issues a full count in addition to the page query. The joined `@Subselect` list entities make these counts expensive at 100k+ rows. For grids that only need next/previous navigation, use `Slice`. Where totals are mandatory, use a dedicated minimal count query without display-only joins, or cache short-lived totals per authorized site/filter.

### P1 — make search indexable

`commonSearch` applies `lower(column) LIKE '%value%'` to every string field in the list entity. Normal B-tree indexes cannot efficiently support leading-wildcard searches. Limit common search to intentional fields and consider PostgreSQL `pg_trgm` GIN indexes for high-value columns such as request number/title, equipment code/name, employee code/name, and part code/name.

### P1 — tune PostgreSQL only after query/index fixes

- The current 160 MB shared buffer setting is low for this host. On a dedicated database host, test a starting point near 25% of DB-server RAM; do not apply that rule blindly on this shared workstation.
- The 4 MB `work_mem` caused a representative sort spill. Test 8–16 MB per operation for the staging workload, remembering that each connection/query can allocate it multiple times.
- Recalculate `effective_cache_size` for the real database host.
- Re-evaluate JIT for these short OLTP queries; its planning/compilation cost can outweigh benefits.

### P1 — reduce dashboard fan-out

One dashboard journey sends `/dashboard/me` followed by five widget requests. Consolidate stable widget aggregates or cache site/role-scoped results for 15–30 seconds. Ensure cache keys contain authorization scope and never share unauthorized site data.

### P2 — connection and JVM tuning

Do not increase Hikari above 20 simply because concurrency rises. First record active/pending/timeout peaks while PostgreSQL query CPU is visible. After SQL optimization, use JFR/async-profiler during the 25-user stage to split CPU between security filtering, JSON serialization, Hibernate result mapping, logging, Vite, k6, and PostgreSQL.

## Tooling defect found

`performance-data-generator/sql/verify-large-data.sql` references the psql variable `:'run_id'` inside a dollar-quoted `DO` body. psql does not substitute variables there, causing a syntax error. Independent read-only count queries confirmed all eight required dataset counts. The verification script should place the value into a temporary table outside the `DO` block and read it from there.

## Required retest sequence

1. Fix the verification script and confirm counts.
2. Deploy with production logging and a production reverse proxy.
3. Start `pg_stat_statements`, JVM, Hikari, OS, and PostgreSQL monitoring.
4. Run k6 externally: smoke → 10 → 25 → 50 → 100.
5. Stop any stage with errors above 5%, sustained CPU above 90%, increasing Hikari pending connections, memory exhaustion, or excessive disk latency.
6. Only if 100 users pass with at least 20–25% resource headroom, run the 100 → 200 → 300 stress profile.
7. Treat 70–80% of the highest passing, headroom-safe stage as the initial single-instance operating target, then validate horizontal scaling.

## Readiness conclusion

**PARTIALLY READY.** Ten concurrent active users passed comfortably. The current local topology saturated the four-logical-CPU host at 25 VUs, so 25, 50, 100, and stress capacity are not approved. Database indexing/count-query work, production-profile testing, and an external load generator are the immediate priorities.
