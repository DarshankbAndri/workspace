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

Current frontend feature folders include `admin`, `approval`, `assignment`, `auth`, `company`, `dashboard`, `downtime`, `employee`, `equipment`, `maintenance`, `maintenanceRequest`, `notification`, `preventiveMaintenance`, `report`, `site`, `spareParts`, `user`, and `vendor`.

## Lombok Rules

1. Use Lombok for DTO boilerplate when getters, setters, constructors, and builders have no custom logic.
2. Use `@Getter` and `@Setter` for JPA entities, not `@Data`.
3. Use `@RequiredArgsConstructor` for dependency injection.
4. Do not use field injection for new code.
5. Do not remove custom methods, custom constructors, lifecycle hooks, or getters/setters with business logic.
6. Always run `mvn clean install` from `cmms_back_end` after Lombok changes.

## Liquibase Rules

1. For new tables, always create Liquibase XML using `<createTable>`, not raw SQL.
2. Use one table per file or one clear table-focused changeSet.
3. Add foreign keys after base tables are created.
4. Add indexes separately after tables and constraints.
5. Do not use raw SQL for normal table, index, column, primary key, foreign key, or unique-constraint creation.
6. Keep changelogs module-wise under the existing changelog structure.
7. For a fresh first-time setup, keep the schema clean instead of preserving unnecessary incremental changes.
8. Always test Liquibase changes by dropping or clearing the local database and running migrations from scratch.
9. Always run `mvn clean install` from `cmms_back_end` after Liquibase changes.
