# AGENTS.md

## Graphify Project Memory

Before making code changes, first use Graphify/project graph to understand:

- Existing architecture.
- Related files.
- Entity/DTO/DAO/Repository/Service/Controller pattern.
- React routes.
- Axios services.
- Authentication flow.
- Database schema.

For every new feature:

1. Query Graphify for related files.
2. Read only the most relevant files.
3. Reuse existing patterns.
4. Avoid duplicate APIs/files.
5. Preserve existing authentication.
6. Summarize files changed after implementation.
7. Place every new file in the module-based structure described below.

Use commands like:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "What files are related to preventive maintenance?"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" affected "PreventiveMaintenanceScheduleService"
```

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Module-Based Structure

Future development must follow the module/page-based structure already used in this repository. Do not add new files back into broad global folders such as `controller`, `service`, `repository`, `entity`, `dto`, `pages`, `services`, or `components`.

### Backend

For every new backend page/module, create or reuse a lowercase package under:

```text
cmms_back_end/src/main/java/com/example/cmmsApplication/{module}/
    controller/
    service/
    repository/
    dao/
    entity/
    dto/
    mapper/
    enums/
```

Rules:

1. Put controllers in `{module}/controller`.
2. Put services and service implementations in `{module}/service`.
3. Put repositories in `{module}/repository`.
4. Put DAO wrappers/adapters in `{module}/dao`.
5. Put entities in `{module}/entity`.
6. Put DTO/request/response classes in `{module}/dto`.
7. Put mappers/converters in `{module}/mapper`.
8. Put module-specific enums in `{module}/enums`.
9. Keep shared code in `common`, including `common/config`, `common/exception`, `common/security`, `common/search`, `common/enums`, `common/utils`, `common/constants`, and shared response types.
10. Keep security/auth/global exception/config files in common/global packages, not inside page modules.
11. Preserve existing package/module boundaries when modifying code.

Current backend modules include `admin`, `approval`, `assignment`, `company`, `dashboard`, `downtime`, `employee`, `equipment`, `maintenancerequest`, `notification`, `preventivemaintenance`, `report`, `site`, `spareparts`, `user`, and `vendor`.

## API Response Contract

1. Every JSON REST endpoint must return `ApiResponse<T>` for successful responses.
2. Never create controller-specific success or error envelope DTOs.
3. Controllers must use `ResponseFactory` instead of manually constructing response envelopes.
4. Exceptions must flow through `GlobalExceptionHandler` and return `ApiErrorResponse`.
5. Use standard machine-readable error codes from `ApiErrorCode`.
6. Include `correlationId` in API responses and exception logs.
7. Validation errors must use the standard `details` array with `field` and `message`.
8. Do not expose stack traces in API responses; log stack traces only on the server.
9. Binary downloads and event streams may remain raw protocol responses, but all normal JSON APIs must follow the standard contract.
10. Frontend API error handling must read `code`, `message`, `details`, and `correlationId`.

## API Permission Rules

1. API authorization is centralized in `JwtFilter` through `ApiPermissionService`.
2. Do not add `accessControlService.validatePermission(...)` calls in controllers or services.
3. Keep record-level and site-level business access checks in services, such as `validateSiteAccess`.
4. Every protected backend API must have a row in `cmms_back_end/src/main/resources/api-permission-mapping.csv`.
5. Use the same path shape seen by the backend request URI, including `/api` when the servlet context path is `/api`.
6. Keep `permission_api_mapping.xml` as the single Liquibase file for the `permission_api_mapping` table, indexes, unique constraint, and foreign key.
7. When adding or changing role, permission, or API mapping behavior, clear the `api-permissions` cache after successful changes.
8. Only add public endpoints through `cmms.security.public-api-patterns`; avoid hardcoded bypasses.
9. Leave `cmms.security.deny-unmapped-api=true` for production unless there is an explicit migration window.
10. New frontend helper/list APIs must be mapped to the page permission that needs them, not only to their owning module permission.

## Observability Rules

1. Every request must have a correlation ID from `X-Correlation-Id` or a generated UUID.
2. Logs must include `correlationId` and `userId` when authenticated.
3. Do not log passwords, JWT tokens, authorization headers, refresh tokens, or sensitive request/response payloads.
4. Request logging must emit one structured summary line per request with method, path, status, duration, and error code.
5. Unexpected exceptions must be logged once at ERROR with stack trace and correlation ID.
6. Expected business/client exceptions should be WARN without duplicate stack traces.
7. Add Micrometer metrics for new scheduled jobs and critical workflows.
8. Avoid high-cardinality metric tags such as raw username, email, entity id, or free-form path.
9. Use standard API error codes in responses, metrics, and logs.
10. Keep actuator sensitive endpoints protected; expose only health/liveness/readiness publicly unless explicitly approved.

### Frontend

For every new UI page/module, create or reuse a feature folder under:

```text
cmms_front_end/src/features/{moduleName}/
    pages/
    components/
    services/
    hooks/
    constants/
```

Rules:

1. Put page files in `src/features/{moduleName}/pages`.
2. Put page-specific components in `src/features/{moduleName}/components`.
3. Put module API wrappers in `src/features/{moduleName}/services`.
4. Put module hooks/constants in `src/features/{moduleName}/hooks` and `src/features/{moduleName}/constants`.
5. Put reusable UI components in `src/shared/components`.
6. Put layouts/navigation shells in `src/shared/layouts`.
7. Put shared clients/utilities in `src/shared/services` and `src/shared/utils`.
8. Do not duplicate components or API wrappers across feature folders.
9. Update all imports and route imports after moving or adding files.
10. Run backend compile and frontend build after structural changes.

Shared frontend component rules:

1. Do not create repeated dropdown logic inside pages.
2. Use `CommonDropdown` or `CommonStatusDropdown` for dropdown/select fields.
3. Use `CommonList` for list pages where practical.
4. Keep dropdown API loading inside `useDropdownOptions` where possible.
5. Shared option arrays must go inside `src/shared/constants`.
6. New pages must follow the common component pattern.
7. All list, create, edit, and dialog form pages must use shared common components. Do not directly use MUI `TextField`, `Select`, `MenuItem`, `Autocomplete`, `DatePicker`, or `DateTimePicker` inside feature pages. Use `CommonInput`, `CommonDropdown`, `CommonDatePicker`, `CommonDateTimePicker`, `CommonTextArea`, `CommonFormActions`, and `CommonFormCard` from `src/shared/components/common/` instead.
8. `CommonDropdown` uses MUI `Autocomplete` (typeahead). Pass `options` as `{value, label}` objects. Dynamic disabled options use `{value, label, disabled: true}` — the component already handles this via `getOptionDisabled`. `onChange` fires `(event, option)` where `event.target.value` is the option value, compatible with `updateField(field)` handlers.
9. For table-cell inline dropdowns and inputs, pass `size="small"` to `CommonDropdown` and `CommonInput`.

Frontend navigation rules:

1. All applicable list pages must follow List -> View -> Edit flow.
2. Clicking a list row must navigate to the View page.
3. Do not add a separate View icon column unless explicitly requested.
4. Do not place Edit actions directly on list pages.
5. Edit actions must be available from the View page and protected by UPDATE permission.
6. Interactive cells must stop row-click propagation.
7. View routes require VIEW permission and Edit routes require UPDATE permission.
8. Use the shared CommonList navigation capability where available.

Current frontend feature folders include `admin`, `approval`, `assignment`, `auth`, `company`, `dashboard`, `downtime`, `employee`, `equipment`, `maintenance`, `maintenanceRequest`, `notification`, `preventiveMaintenance`, `report`, `site`, `spareParts`, `user`, and `vendor`.

## Lombok Rules

1. Use Lombok for boilerplate in all future backend classes.
2. DTOs should use `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, and `@Builder` where useful and safe.
3. JPA entities should use `@Getter` and `@Setter`, not `@Data`.
4. Controllers and services should use `@RequiredArgsConstructor` with `private final` dependencies.
5. Do not use field injection.
6. Do not remove custom methods, custom constructors, lifecycle hooks, or custom getter/setter logic.
7. Always run `mvn clean install` from `cmms_back_end` after Lombok changes.

## Liquibase Rules

1. For new tables, always create Liquibase XML using `<createTable>`, not raw SQL.
2. Always use one XML file per table.
3. Do not create separate XML files for indexes.
4. Do not create separate XML files for foreign keys.
5. Keep each table's creation, indexes, unique constraints, and foreign keys in that table's XML file.
6. One XML file must not create more than one table.
7. One XML file can contain multiple changeSets, but only for the same table.
8. Use Liquibase XML tags such as `<createTable>`, `<createIndex>`, `<addForeignKeyConstraint>`, `<addUniqueConstraint>`, and `<addNotNullConstraint>` for normal schema changes.
9. Do not use raw SQL for normal table, index, column, primary key, foreign key, or unique-constraint creation.
10. For existing tables, do not edit existing committed changeSets to add new columns, indexes, constraints, or foreign keys. Append a new changeSet in that table's existing XML file instead.
11. Include table XML files in dependency order in `db.changelog-master.xml`; if a foreign key references another table, include the referenced table XML before the table that owns the foreign key.
12. Keep changelogs module-wise under the existing changelog structure.
13. For a fresh first-time setup, keep the schema clean instead of preserving unnecessary incremental changes.
14. Always test Liquibase changes by dropping or clearing the local database and running migrations from scratch.
15. Always run `mvn clean install` from `cmms_back_end` after Liquibase changes.

## Vendor AMC Rules

1. AMC contracts must be stored separately from vendor master.
2. Equipment must be mapped using `equipment_amc_mapping`.
3. Do not overwrite expired AMC history during renewal.
4. Use renewal linkage through `renewed_from_contract_id`.
5. Maintenance requests linked to AMC must preserve contract and vendor references.
6. Every AMC API must be added to the API permission mapping CSV.
7. All frontend AMC pages must use common components.
8. Frontend and backend permission checks must be maintained.
