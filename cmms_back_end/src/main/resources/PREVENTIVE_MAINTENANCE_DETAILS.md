# Preventive Maintenance Module

## Purpose

Preventive Maintenance is used to create recurring maintenance schedules for equipment before breakdown happens. Instead of manually creating every maintenance request, the system can generate preventive maintenance work orders from a schedule.

## Current Process Flow

1. Create PM Schedule
   - Select Equipment.
   - Optionally select Assigned Vendor.
   - Optionally enter Assigned To.
   - Enter PM Task title.
   - Enter Description.
   - Select Frequency:
     - DAILY
     - WEEKLY
     - MONTHLY
     - QUARTERLY
     - YEARLY
   - Select Priority:
     - LOW
     - MEDIUM
     - HIGH
     - CRITICAL
   - Select Start Date.
   - Select Next Due Date.
   - Set Active or Inactive.

2. Save Schedule
   - Backend creates a preventive maintenance schedule record.
   - If schedule code is not provided, backend auto-generates one.
   - Example format:

```text
PM-20260612-...
```

3. Generate Work Order
   - User can generate one work order from a selected PM schedule.
   - Backend creates a Maintenance Request with:
     - Request type: PREVENTIVE
     - Status: OPEN
     - Equipment from the PM schedule
     - Title and description from the PM schedule
     - Priority from the PM schedule
     - Reported by: PM Scheduler
     - Target completion date: current next due date

4. Auto Assignment
   - If vendor or assigned person exists, backend creates a Maintenance Assignment.
   - Assignment status becomes ASSIGNED.
   - Planned start and planned end date use the PM schedule due date.
   - Remarks mention the PM schedule code.

5. Vendor Notification Tracking
   - Actual email is not sent yet.
   - Backend records notification status:
     - NO_VENDOR_ASSIGNED
     - CONTACT_PENDING
     - EMAIL_QUEUED for request number

6. Next Due Date Update
   - After work order generation, backend updates:
     - lastGeneratedDate
     - nextDueDate
   - Example:
     - Monthly schedule due on 2026-06-12
     - After generation, next due becomes 2026-07-12

7. Generate All Due Work Orders
   - Button: Generate Due Work Orders
   - Backend finds all active schedules where nextDueDate is less than or equal to today.
   - It generates work orders for all due schedules.

8. Automatic Daily Generation
   - Backend has a scheduled job.
   - It runs daily at 06:00.
   - It calls generateDueWorkOrders().
   - This can automatically generate due preventive maintenance work orders.

## Current Frontend Features

The Preventive Maintenance page currently supports:

- Create PM schedule
- Edit PM schedule
- Delete PM schedule
- Generate single work order
- Generate all due work orders
- DataGrid schedule list
- Completion progress bar
- Vendor notification status
- Generated work order count
- Completion percentage

Frontend files:

```text
cmms_front_end/src/pages/maintenance/PreventiveMaintenancePage.jsx
cmms_front_end/src/services/preventiveMaintenanceService.js
```

## Current Backend APIs

Base path:

```text
/api/preventive-maintenance/schedules
```

Available APIs:

```text
GET    /api/preventive-maintenance/schedules
GET    /api/preventive-maintenance/schedules/{id}
POST   /api/preventive-maintenance/schedules
PUT    /api/preventive-maintenance/schedules/{id}
DELETE /api/preventive-maintenance/schedules/{id}

GET    /api/preventive-maintenance/schedules/upcoming?days=30
POST   /api/preventive-maintenance/schedules/{id}/generate-work-order
POST   /api/preventive-maintenance/schedules/generate-due-work-orders
```

Backend files:

```text
cmms_back_end/src/main/java/com/example/cmmsApplication/entity/PreventiveMaintenanceSchedule.java
cmms_back_end/src/main/java/com/example/cmmsApplication/dto/PreventiveMaintenanceScheduleDTO.java
cmms_back_end/src/main/java/com/example/cmmsApplication/controller/PreventiveMaintenanceScheduleController.java
cmms_back_end/src/main/java/com/example/cmmsApplication/service/PreventiveMaintenanceScheduleService.java
cmms_back_end/src/main/java/com/example/cmmsApplication/dao/PreventiveMaintenanceScheduleDAO.java
cmms_back_end/src/main/java/com/example/cmmsApplication/repository/PreventiveMaintenanceScheduleRepository.java
```

## Database Fields

Table:

```text
preventive_maintenance_schedule
```

Current fields:

- id
- equipment_id
- vendor_id
- schedule_code
- title
- description
- frequency
- priority
- assigned_to
- start_date
- next_due_date
- last_generated_date
- active
- last_notification_status
- last_notification_at
- created_at
- updated_at

## Dashboard Integration

Dashboard currently uses upcoming PM schedules.

It shows:

- PM schedules due in next 30 days
- PM title
- Equipment name
- Next due date
- Frequency
- Completion percentage

## Current Limitations

These items are not fully implemented yet:

- Site selection in Preventive Maintenance
- Vendor filtering by equipment/site
- Real email or WhatsApp notification
- Duplicate work order prevention for same due date
- PM calendar view
- PM checklist or task steps
- Technician mobile workflow
- Spare parts planning
- Attachment support
- Approval workflow
- PM compliance reports
- PM overdue status
- Work order completion screen specifically tied back to PM

## Recommended Future Enhancements

1. Site-wise PM
   - Add siteId to PM schedule.
   - Filter equipment by selected site.
   - Filter vendors by selected site.

2. PM Checklist
   - Add checklist items per schedule.
   - Example:
     - Inspect bearing
     - Check lubrication
     - Measure vibration
     - Clean filter

3. Duplicate Prevention
   - Prevent generating two work orders for the same schedule and due date.

4. PM Calendar
   - Add monthly and weekly calendar views showing due PM tasks.

5. PM Compliance
   - Planned vs completed.
   - Overdue PM count.
   - Completion percentage by site, equipment, and vendor.

6. Notification Engine
   - Real email or WhatsApp reminders before due date.
   - Escalation after overdue.

7. Auto Work Order Closing Link
   - When generated maintenance request is closed, update PM completion metrics.

8. Site and Vendor Validation
   - Ensure selected vendor is assigned to the equipment site.

## Summary

The current Preventive Maintenance module is a functional base. It can create recurring PM schedules, generate preventive maintenance requests, create vendor/team assignments, update next due dates, track notification status, and show progress in the UI.

