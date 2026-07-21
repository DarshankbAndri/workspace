> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 5. Maintenance Requests, Assignments, Work Logs, and Downtime

### Maintenance requests

**Where:** Maintenance → Requests · **Permissions:** `REQUEST_VIEW/CREATE/UPDATE/DELETE`.

Create a request when equipment needs corrective or inspection work—for example, inverter communication failure or transformer oil leakage. Select site/equipment, enter title and issue description, priority/type/status and relevant dates/attachments shown by the form, then save/submit. The request becomes visible to permitted site users and can enter approval or assignment according to configuration. Open a row to see details, edit in allowed states, and follow its assignments, work, downtime, and spares.

Do not duplicate an open request for the same symptom. Use a clear observable problem, not only “not working.” The exact lifecycle is represented by the status shown on the record; action buttons are permission- and state-dependent.

### Assignments and technician work

**Where:** Maintenance → Assignments · **Permissions:** `ASSIGNMENT_VIEW/CREATE/UPDATE/DELETE` plus action APIs exposed on the assignment view.

1. Create an assignment from/for a maintenance request.
2. Select responsible technician/employee or vendor as supported, planned start/end, priority, and instructions.
3. Save; the assignee can open the record and perform available start/status actions.
4. Add checklist responses and work logs. Record issue found, action taken, notes, time, attachments, and completion status.
5. Request required spares from the assignment workflow; after work and checks are complete, complete the assignment/request using the available action.

Multiple work logs can preserve the sequence of diagnosis and repair. Example: “Loose communication cable in inverter control panel” followed by “Cable reseated, terminal tightened, communication verified.” These records contribute to equipment maintenance history.

### Downtime

**Where:** Maintenance → Downtime · **Permissions:** `DOWNTIME_VIEW/CREATE/UPDATE/DELETE`; actions `DOWNTIME_CONFIRM`, `DOWNTIME_VERIFY`, `DOWNTIME_CLOSE`, `DOWNTIME_REOPEN`, `DOWNTIME_RCA_MANAGE`.

Create downtime with site/equipment, start time, type/reason/category, request linkage, and production-loss information available on the form. Leave end time open while the outage continues. Authorized users progress confirm/verify/close actions; closing requires the necessary end and review information. RCA captures cause and corrective/preventive action. Reopen only when closure was incorrect or the event continues.

Downtime Analysis reports event count, unplanned events, and duration. Accurate timestamps are essential for production-impact reporting.

