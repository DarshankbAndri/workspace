## Phase 9: Warranty and AMC Tracking

Goal:
Manage warranty, AMC, contract, and vendor responsibility.

Implementation:
1. Extend equipment fields:
   - `warranty_provider`
   - `warranty_terms`
   - `amc_vendor_id`
   - `amc_start_date`
   - `amc_end_date`
   - `contract_number`
2. Add warranty/AMC expiry alerts.
3. Add Warranty/AMC section in equipment view.
4. Link vendor if available.

Testing:
- Expiry alert generated before due date.
- AMC vendor obeys site/vendor assignment rules.
- Equipment view shows warranty/AMC status.