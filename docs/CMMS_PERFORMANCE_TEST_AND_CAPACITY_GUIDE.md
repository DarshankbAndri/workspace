# CMMS performance test and server-capacity guide

## Purpose

Use this guide to create realistic staging data, run repeatable concurrent-user tests, determine the CMMS application's measured capacity, and select production CPU, RAM and SSD storage.

The bulk data loader is in `performance-data-generator/`, and the concurrent-user test is in `performance-tests/`. Each directory contains its own installation and run instructions.

## Required order

1. Back up the staging PostgreSQL database.
2. Confirm the frontend, backend and database are healthy.
3. Generate the large connected dataset with `performance-data-generator/generate.ps1`.
4. Prove the exact row counts with `performance-data-generator/verify.ps1`.
5. Run the one-user smoke profile.
6. Run the 10-user baseline profile.
7. Run the 25/50/100-user load profile.
8. Fix errors and database bottlenecks before running stress tests.
9. Run the 100/200/300-user stress profile to locate the failure point.
10. Repeat the final test three times before accepting the result.

## Data-volume targets

For a meaningful production test, use approximately:

| Table/workflow | Minimum useful volume | Large-volume target |
| --- | ---: | ---: |
| Sites | 25 | 100 |
| Employees/users | 1,000 | 5,000 |
| Equipment | 10,000 | 50,000 |
| Maintenance requests | 25,000 | 100,000 |
| Assignments | 25,000 | 100,000 |
| Work logs | 100,000 | 500,000 |
| Downtime entries | 25,000 | 100,000 |
| Spare transactions | 50,000 | 100,000 |
| Notifications | 100,000 | 1,000,000 |

The new PostgreSQL bulk loader creates these exact large-volume targets, verifies them before commit, and runs PostgreSQL `ANALYZE`. The Playwright generator remains useful for smaller UI workflow datasets.

## Acceptance criteria

| Metric | Target |
| --- | ---: |
| HTTP/API error rate | Below 1% |
| Read API p95 | Below 500–1000 ms |
| Write API p95 | Below 1 second |
| Dashboard p95 | Below 2 seconds |
| CPU sustained | Below 75–80% |
| JVM heap after GC | Below 75–80% |
| Database pool utilization | Below 80% |
| PostgreSQL disk utilization | Below 70–80% sustained |

## Initial hardware starting points

These values are deployment starting points, not measured guarantees:

| Active concurrent users | API tier | PostgreSQL tier | SSD/NVMe |
| ---: | --- | --- | ---: |
| Up to 50 | 2 vCPU, 4 GB RAM | 2 vCPU, 4 GB RAM | 50 GB |
| Up to 100 | 4 vCPU, 8 GB RAM | 4 vCPU, 8 GB RAM | 100 GB |
| Up to 250 | 2 × 4 vCPU, 8 GB RAM | 8 vCPU, 16 GB RAM | 200 GB |
| Up to 500 | 3 × 4 vCPU, 8 GB RAM | 12 vCPU, 32 GB RAM | 300 GB |
| Up to 1,000 | 4–6 × 4 vCPU, 8 GB RAM | 16 vCPU, 64 GB RAM | 500 GB+ |

Start the current CMMS production environment with a 4-vCPU/8-GB application server and a separate 4–8-vCPU/16-GB PostgreSQL server. Use NVMe/SSD storage and keep at least 30% disk space free.

## Current code-level bottlenecks

- Hikari is configured for a maximum of 20 database connections. Tune it only after measuring PostgreSQL capacity; more connections can reduce performance.
- Several dashboard paths load complete entity tables and aggregate in Java. Move large aggregations into indexed SQL/JdbcTemplate queries.
- Several compatibility/list paths still call `findAll()`. Keep list pages on server-side pagination and restrict helper APIs.
- Application and Spring Security DEBUG logging should be disabled in production.
- Local `/cmms/documents` storage prevents safe horizontal scaling. Use shared MinIO/S3-compatible storage.
- Notification SSE connections and cache state are instance-local. Multi-instance deployments need shared event distribution, such as Redis pub/sub, and load-balancer configuration for long-lived streams.

## Capacity decision rule

Choose the highest stage that passes all latency and error thresholds while CPU, memory, database connections and disk retain at least 20–25% headroom. Production's planned load should normally be no more than 70–80% of that measured stage.

If one API instance passes 100 users but fails at 200, do not claim 200-user capacity. Plan approximately 70–80 active users per instance, add a load balancer and a second instance, then repeat the same test against the full deployment.

## Current test status

The first external smoke check on 2026-08-28 could not reach the supplied staging environment. The frontend timed out and the backend path returned `502 Bad Gateway` with `connection refused`. Because the service was unavailable, no load ramp or hardware measurement was performed. Restore staging connectivity and rerun the smoke profile before accepting any capacity number.
