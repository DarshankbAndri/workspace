Implement Equipment backend pagination/filter/sort using existing common SearchServiceImp pattern.

Current project already has common search implementation:

- SearchService
- SearchServiceImp
- SearchDTO
- PageProperties
- SearchOperation
- JpaSpecificationExecutor based dynamic filtering

Requirement:
Do not create a new search framework.
Reuse existing SearchServiceImp common method.

Implement backend search/list API for Equipment using the same pattern as existing VendorList @Subselect approach.

Reference pattern:
- VendorList entity uses @Subselect for list view
- Repository extends JpaSpecificationExecutor
- Controller/service calls common SearchService.getFilteredResults()

Required API:
POST /api/equipment/search

Request body:
SearchDTO format already used in project.

Example:
{
  "searchCriteriaList": [
    {
      "filterKey": "equipmentName",
      "dataType": "VARCHAR",
      "value": "INV",
      "operation": "contains"
    }
  ],
  "dataOption": "all",
  "pagination": {
    "status": "ON",
    "recordsPerPage": 10,
    "sortBy": "equipmentName",
    "sortMode": "ASC",
    "pageNumber": 0,
    "pageSize": 0
  }
}

IMPORTANT:
Use operation names supported by current SearchOperation.
If frontend sends "like", map it to existing CONTAINS operation or add alias support.

BACKEND TASKS

1. Create EquipmentList entity using @Subselect.

Example fields should match current equipment table/entity:

- id
- equipmentCode
- equipmentName
- equipmentType
- status/equipmentStatus
- siteId
- siteCode
- siteName
- vendorId if available
- vendorName if available
- make
- model
- serialNumber
- createdAt/createdDate if available
- lastModifiedOn if available

Use actual table names and column names from current schema.

Example:

@Entity
@Subselect("""
    SELECT
        e.id,
        e.equipment_code AS equipment_code,
        e.equipment_name AS equipment_name,
        e.equipment_type AS equipment_type,
        e.status AS equipment_status,
        s.site_id AS site_id,
        s.site_code AS site_code,
        s.site_name AS site_name,
        e.make,
        e.model,
        e.serial_number,
        e.created_at
    FROM equipment_master e
    LEFT JOIN site_master s ON s.site_id = e.site_id
""")
public class EquipmentList extends CommonEntity {
   ...
}

Adapt column aliases so Java field mapping works correctly.

2. Create EquipmentListRepository:

public interface EquipmentListRepository
    extends JpaRepository<EquipmentList, Long>,
            JpaSpecificationExecutor<EquipmentList> {
}

3. Add Equipment search service method.

Use existing common search service:

PageProperties searchEquipment(SearchDTO searchDTO) {
    validateEquipmentSearchKeys(searchDTO);
    normalizeOperations(searchDTO);
    applySiteAccessFilter(searchDTO);
    return searchService.getFilteredResults(
        searchDTO,
        equipmentListRepository,
        EquipmentList.class
    );
}

4. Add validation for allowed filter keys.

Allowed:
- equipmentName
- equipmentCode
- equipmentType
- equipmentStatus
- status
- siteId
- siteCode
- siteName
- vendorId
- vendorName
- make
- model
- serialNumber
- commonSearch

Reject unknown filter keys.

5. Operation mapping.

Current SearchServiceImp supports:
- equal
- contains
- in
- between
- not_equal

If frontend sends:
- eq -> map to EQUAL
- like -> map to CONTAINS
- in -> IN

Add support for:
- gt
- lt
- gte
- lte

Only if needed by existing SearchOperation enum.
Update SearchOperation and SearchServiceImp carefully.

6. Fix common SearchServiceImp if needed.

Current SearchServiceImp ignores searchDTO.dataOption and always uses AND.

Update it:
- dataOption = "all" => cb.and(...)
- dataOption = "any" => cb.or(...)

Keep existing behavior default as AND.

7. Sorting.

Use existing pagination.sortBy and sortMode.

Validate sortBy against allowed keys before calling SearchServiceImp.

If sortBy is null:
- use createdAt DESC if EquipmentList has createdAt
- else id DESC

If existing SearchServiceImp defaults to id ASC, update only if safe or handle before calling it.

8. Site access filtering.

Keep backend site access restriction active.

Before calling SearchServiceImp:
- Get allowed site IDs from existing AccessControlService if available.
- If user is not admin/super admin, add siteId IN allowedSiteIds to SearchDTO.
- If request already has siteId filter, validate user has access to that site.
- Do not return equipment from unauthorized sites.

9. Controller.

Add endpoint:

@PostMapping("/search")
public ResponseEntity<?> searchEquipment(@RequestBody SearchDTO searchDTO)

Reuse existing response wrapper if project uses it.

10. Do not break existing Equipment APIs:
- create
- update
- getById
- delete
- getAll if already used

FRONTEND TASKS

Update Equipment List page to call POST /api/equipment/search.

Use existing SearchDTO structure.

Initial load payload:

{
  "searchCriteriaList": [],
  "dataOption": "all",
  "pagination": {
    "status": "ON",
    "recordsPerPage": 10,
    "sortBy": null,
    "sortMode": null,
    "pageNumber": 0,
    "pageSize": 0
  }
}

For search text:
Use commonSearch if UI has one search box:

{
  "filterKey": "commonSearch",
  "dataType": "VARCHAR",
  "value": "<search>",
  "operation": "contains"
}

For specific filters:
- siteId => equal
- equipmentType => equal
- equipmentStatus/status => equal
- equipmentName => contains

Pagination:
- pageNumber zero based
- recordsPerPage from table page size

Sorting:
- sortBy should match EquipmentList field name
- sortMode ASC/DESC

After add/edit/delete:
Reload current backend page.

IMPORTANT CODING RULES

1. Analyze VendorList @Subselect and existing search usage first.
2. Reuse common SearchServiceImp.
3. Do not create duplicate pagination code.
4. Do not use raw SQL string concatenation for filters.
5. Do not break existing APIs.
6. Do not change frontend UI design.
7. Ensure backend compiles.
8. Ensure frontend builds.

After implementation, summarize:
- EquipmentList entity created
- Repository created
- API added
- SearchServiceImp changes if any
- Frontend files updated
- How to test