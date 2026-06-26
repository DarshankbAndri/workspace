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
