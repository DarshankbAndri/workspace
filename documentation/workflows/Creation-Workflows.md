# CMMS Creation and Transaction Workflows

## Asset setup

```text
Create site → create/assign employees and vendors → create equipment
→ map AMC and equipment spare BOM → schedule preventive maintenance
```

## Corrective maintenance

```text
Create maintenance request → approval when configured → create assignment
→ execute checklist/work logs → request and consume spares
→ record/restore/verify/close downtime → complete request/assignment
```

## Preventive maintenance

```text
Create PM schedule and checklist template → approve schedule when configured
→ scheduler/manual action generates request and optional assignment
→ checklist copied to assignment → technician logs work/proof
→ complete assignment and advance next due date
```

## Spare fulfilment

```text
Spare request → manager approve/reject → store stock check
→ reserve → issue → consume/return
or shortage → reorder → receipt → reserve/issue
```

## Downtime

```text
Open → Confirmed → Under Maintenance → Restored → Verified → Closed
                                      └→ RCA/root cause required for major downtime
Closed/Verified → Reopened (authorized exception)
```

## Authorization

```text
Role → permissions → user/employee role assignment
→ frontend route/action visibility → backend API mapping
→ record/site access → allowed business operation
```

