> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.

## 4. Vendors, AMC, and Equipment

### Vendors

**Where:** Masters → Vendors · **Permissions:** `VENDOR_VIEW/CREATE/UPDATE/DELETE`.

Vendors represent inverter manufacturers, SCADA support firms, tracker providers, transformer specialists, and spare suppliers. Create a vendor with code, name, type, contacts, tax/address data, status, and supported sites. Save returns to the list. Open a row for details, related equipment, and available history; edit only with update permission. Inactive vendors should not be selected for new work.

### Annual Maintenance Contracts (AMC)

**Where:** Masters → Vendor AMC · **Permissions:** `VENDOR_AMC_VIEW/CREATE/UPDATE/DELETE`; special actions `VENDOR_AMC_ASSIGN_EQUIPMENT`, `VENDOR_AMC_RENEW`.

AMC means Annual Maintenance Contract. It connects a vendor, contract dates/SLA/coverage, and selected equipment.

1. Select **Create AMC**, choose vendor/site, enter contract number, dates, SLA, coverage, value/status, and covered equipment.
2. Save and open the contract view to inspect coverage.
3. Use **Renew** to create linked renewal history; do not overwrite an expired contract.
4. During a maintenance request, the system can retain AMC vendor/contract references for covered equipment.

Expiry information is available in dashboard/notifications where configured. AMC approval is not a dedicated user workflow. Labor/spares are captured as coverage information; there is no full vendor portal.

### Equipment

**Where:** Masters → Equipment · **Permissions:** `EQUIPMENT_VIEW/CREATE/UPDATE/DELETE`.

Use equipment records for central/string inverters, transformers, trackers, combiner boxes, weather stations, pyranometers, SCADA servers, pumps, DG sets, and UPS units.

1. Search/filter the list, then click a row or view icon.
2. Review identity, site, category/type, vendor, model, serial number, criticality, status, warranty, and parent equipment.
3. Select **Edit** if permitted, update fields, and save.
4. Use view-page sections for AMC, maintenance, downtime, and spare-related context where data is exposed.

Category and type values are entered/handled by the existing equipment form; separate category/type master pages do not exist. **Meter Readings are Partially Available:** backend meter-reading support exists, but the current frontend has no dedicated meter/runtime route or usable reading tab. Automatic SCADA/historian ingestion is Not Available.

