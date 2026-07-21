> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 6. Preventive Maintenance

**Where:** Maintenance → Preventive Maintenance / PM Calendar  
**Current permissions:** list/view uses `REQUEST_VIEW`, create uses `REQUEST_CREATE`, edit uses `REQUEST_UPDATE`; calendar uses `PM_CALENDAR_VIEW`.

Preventive maintenance schedules recurring work before failure—for example monthly inverter inspection, quarterly transformer thermography, tracker lubrication, pyranometer calibration, module cleaning, or SCADA backup.

1. Select **New**, choose site/equipment, provide schedule title/type, frequency and interval, start/next due information, responsibility, checklist, priority, and activation details exposed by the form.
2. Save. The schedule appears in the PM list and calendar and contributes to upcoming-maintenance dashboard data.
3. Open the schedule to review execution history and available actions.
4. When due, create/execute the related maintenance work through the current request/assignment flow, complete checklist/work logs, and confirm the next due date is advanced.

The calendar helps planners see date-based demand. Overdue means the due date passed without completion. **Meter-based PM is Partially Available:** backend meter capability exists, but there is no current end-user meter-reading page to operate the full threshold flow. **PM spare-parts forecasting/BOM planning is Not Available** in the current application; it remains a proposed future feature, not part of this manual's operating steps.

