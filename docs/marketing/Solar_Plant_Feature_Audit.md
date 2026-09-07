# Solar Plant Marketing Presentation — Repository Feature Audit

Audit date: 2026-08-11  
Repository head reviewed: `948fa55a5409404ad0bf2c2cef5f0114eba5ee45`

The saved Graphify graph (7,346 nodes / 15,529 edges) was used for repository-wide discovery. Because its snapshot was built from an earlier commit, every capability selected for the presentation was corroborated against the current frontend, backend, workflow, and schema files.

| Customer-facing capability | Repository evidence reviewed | Status | Presentation decision |
|---|---|---:|---|
| Central equipment registry | Equipment list/form/view pages; equipment controller/service; equipment entity, DTO, documents, spare BOM, AMC mapping | Complete | Include |
| Rich asset attributes | Code, name, type, category, location, manufacturer, model, serial, lifecycle, operating status, criticality, warranty, commissioning, ownership and cost fields | Complete | Include |
| Equipment documents | Upload, download and delete document endpoints plus equipment view document tab | Complete | Include |
| Equipment health and reliability | Health score/status, MTBF, MTTR, repeated failures, 90-day downtime, critical open requests and overdue PM | Complete | Include |
| Preventive maintenance schedules | Schedule list/form/view/calendar, daily/weekly/monthly/quarterly/yearly frequency, date range, priority and ownership | Complete | Include |
| PM checklists and proof | Checklist templates with checkbox/text/number/photo response types; checklist copied into generated assignment; proof attachments | Complete | Include |
| Automated PM work-order generation | Daily scheduled generation of due work orders plus manual generation option | Complete | Include |
| Corrective maintenance requests | Formal request creation, priority, target date, asset/site link and state transitions through assign/start/hold/resume/complete/close | Complete | Include |
| Technician and vendor assignment | Assignment to employee or vendor; planned/actual dates, estimated/actual cost, status and remarks | Complete | Include |
| Technician work logs | Start/end time, technician, issue found, action taken, completion status and attachments | Complete | Include |
| Structured equipment downtime | Downtime start/end/duration, planned flag, reason/category/code, linked maintenance request and status workflow | Complete | Include |
| Downtime restoration and verification | Confirm, start maintenance, restore, verify, close and reopen transitions with timeline history | Complete | Include |
| Root-cause actions | Root cause, RCA action list, owner/status/dates and verification path | Complete | Include |
| Spare-parts master and site stock | Part master, unit, preferred vendor, current/reserved/available/minimum stock, unit cost and storage location | Complete | Include |
| Spare request-to-consumption workflow | Request, manager approval, stock check, reserve, issue, consume/return, cancel/reject and purchase request path | Complete | Include |
| Inventory movements | Stock-in, adjustment, inter-site transfer, reorder, stock receipt, transaction history and CSV import | Complete | Include |
| Equipment spare BOM | Recommended spare quantities linked to equipment and site stock | Complete | Include |
| Vendor management | Vendor master, contacts, service category and multi-site assignments | Complete | Include |
| AMC contract management | Site/vendor contract, coverage, SLA fields, labour/spares flags, equipment mapping, PM linkage, renewal history and dashboard | Complete | Include |
| Multi-site management | Site master, employee/vendor site assignments, site-filtered pages and site-level access checks | Complete | Include |
| Employees and technicians | Employee master, designation/department/status, login linkage, roles and site assignments | Complete | Include |
| Role and permission management | Default roles, configurable roles, granular permissions, user-role assignments and protected navigation | Complete | Include |
| Configurable approvals | Approval inbox/history/config for PM schedule/work order, maintenance request create/close and spare reserve/issue | Complete | Include |
| Notifications and reminders | Notification center/settings, in-app and email channels; PM due, overdue request, approval pending, low stock and AMC expiry alerts | Complete | Include exact supported types only |
| Management dashboard | Total equipment, active vendors, open requests, low stock, downtime hours, equipment status, monthly downtime, vendor performance, upcoming PM and role-aware widgets | Complete | Include |
| Reports and analytics | Equipment history, downtime analysis, equipment maintenance cost, site/category/criticality cost groupings and total cost of ownership | Complete | Include |
| Equipment-centered operating context | Equipment profile plus health, open requests count, active PM, downtime, AMC, spare BOM, documents and cost; separate history report for requests, assignments and downtime | Complete, distributed across view/report | Include with precise wording |
| Live SCADA or generation monitoring | No telemetry, irradiance, meter, inverter data feed or generation KPI implementation found | Not implemented | Exclude |
| Automatic solar generation-loss calculation | Generic downtime loss fields exist, but no solar generation/SCADA integration was found | Not implemented as a solar capability | Exclude |
| Automatic fault detection / condition monitoring | No sensor or IoT ingestion implementation found | Not implemented | Exclude |
| QR/barcode equipment access | Mentioned only in an improvement document; no implementation found | Planned only | Exclude |
| Native mobile/offline technician app | No native mobile or offline workflow implementation found | Not implemented | Exclude |
| Assignment-created/status-change alerts | No completed assignment notification producer found | Not implemented | Exclude; use only verified notification types |

## Repository areas analyzed

- Graphify graph and graph report
- Frontend routes, protected navigation, feature folders, pages and service wrappers
- Backend controllers, services, DTOs, entities, repositories and scheduled jobs
- Liquibase table definitions and seeded roles/permissions
- Equipment, PM, maintenance request, assignment/work log, downtime/RCA, spares, vendor/AMC, site/employee, approval, notification, dashboard and report workflows
- Current source changes made after the saved Graphify snapshot

## Accuracy notes for the marketing deck

- Solar equipment names are presented as realistic examples that can be represented in the generic equipment registry.
- The deck does not claim electrical generation, SCADA, inverter telemetry, automatic fault detection or automatic energy-loss monitoring.
- Illustrative plant capacities and stock quantities are labelled as examples, not customer data or built-in demo records.
- Product screenshots, source paths, class names, tables and technical architecture are not shown in the presentation.
