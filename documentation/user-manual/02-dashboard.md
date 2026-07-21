> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 2. Dashboard

**Where:** Dashboard · **Permission:** `DASHBOARD_VIEW`  
The dashboard is role-configurable and site-aware. An administrator can determine which widgets a role receives; a user may therefore see fewer widgets than those listed here.

| Widget | Meaning and management use |
|---|---|
| Total Equipments | Count of equipment in scope; opens no guaranteed filtered list in the current UI. |
| Active Vendors | Active vendor count available to the selected scope. |
| Open Maintenance Requests | Work not in a terminal state; use it to assess backlog. |
| Low Stock Spare Parts | Site-stock lines below their configured minimum. |
| Total Downtime Hours | Aggregated downtime duration for the dashboard scope. |
| Active/Expiring/Expired AMC Contracts | Current contract health; expiring means within 30 days. |
| AMC Covered/Without AMC Equipment | Identifies protection gaps before a failure occurs. |
| Open/Critical/Unassigned/Overdue Requests | Maintenance demand requiring priority, assignment, or escalation. |
| Assigned and overdue work lists | Immediate work responsibility and missed planned dates. |
| Low-stock and reorder lists | Store action queues with available/minimum or requested quantities. |
| Equipment Status | Asset condition distribution. |
| Monthly Downtime | Current-year downtime hours by month. |
| Upcoming Maintenance | PM schedules due in the next 30 days. |
| Vendor Performance | Completed assignments grouped by vendor. |

Choose a site to refresh widgets within your authorized site list. A zero can mean no matching data; an error banner means one or more APIs failed. Example: a critical inverter communication failure appears in open/critical demand, while a cooling fan below minimum stock appears in the inventory widgets.

