# Graphify Usage

This repository uses Graphify as project memory for Codex and future AI coding tasks. Graphify builds a queryable knowledge graph from the CMMS React Vite frontend, Spring Boot backend, database migrations, schema files, and project documentation.

## Installation And Local Command

Graphify is installed from the official PyPI package `graphifyy`; the CLI command is `graphify`.

On this Windows machine it was installed with:

```powershell
python -m pip install --user graphifyy
```

The generated executable is currently here:

```powershell
%APPDATA%\Python\Python314\Scripts\graphify.exe
```

If that directory is not on `PATH`, run Graphify with the full path:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "Where is authentication implemented?"
```

The project also contains `.graphifyignore`, which controls what Graphify indexes.

Codex project integration was registered with:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" codex install
```

That created `.codex/hooks.json` and added a Graphify section to `AGENTS.md`. Because the user Python scripts directory is not currently on `PATH`, the hook command is pinned to the absolute `graphify.exe` path.

## Rebuild Or Update The Graph

From the repository root, rebuild the local code graph with no API key:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" update .
```

This is the command used for the initial project graph in `graphify-out/`.

For a full semantic extraction of Markdown/docs, first configure one of Graphify's supported LLM API keys, such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `GOOGLE_API_KEY`, then run:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" extract .
```

For code-only updates after normal Java or React changes:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" update .
```

To query the graph after it exists:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "How does a maintenance request flow from React page to Spring controller?"
```

To explain a specific node:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" explain "PreventiveMaintenanceScheduleService"
```

To find impact from a backend class or frontend service:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" affected "AuthController"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" affected "api.js"
```

To generate the call-flow HTML report:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" export callflow-html
```

## Included Folders And Files

Graphify should include these project areas:

- `cmms_front_end/src/` for React components, pages, context, services, styles, routes, and Axios usage.
- `cmms_front_end/public/` for frontend static project assets when useful.
- `cmms_front_end/package.json`, `vite.config.js`, `.env.example`, and frontend Markdown docs.
- `cmms_back_end/src/main/java/` for Spring Boot config, controllers, services, repositories, DAOs, DTOs, entities, filters, exceptions, and utilities.
- `cmms_back_end/src/main/resources/` for `application.properties`, seed data, Liquibase changelogs, DDL files, and resource Markdown docs.
- `cmms_back_end/pom.xml` and backend Markdown/API docs.
- Root Markdown docs such as CORS, JWT, Liquibase, and Swagger guides.
- Database files under `cmms_back_end/src/main/resources/db/changelog/` and `cmms_back_end/src/main/resources/db/ddl/`.

## Excluded Folders And Files

The `.graphifyignore` file excludes:

- `.git/`
- `graphify-out/`
- `cmms_front_end/node_modules/`
- `cmms_front_end/dist/`
- `cmms_front_end/build/`
- `cmms_back_end/target/`
- backend or frontend `build/` folders
- logs and `*.log`
- upload folders such as `uploads/`, `uploaded/`, and `uploaded-files/`
- generated report folders such as `reports/` and `generated-reports/`
- temporary folders
- local secret files such as `.env`
- generated dependency lock output where not useful to project memory, such as `cmms_front_end/package-lock.json`
- large binary/archive/media/document artifacts such as `*.jar`, `*.zip`, `*.pdf`, images, videos, audio, `*.xlsx`, and `*.docx`

## How Codex Should Use Graphify Before Coding

Before changing code, Codex should query Graphify to identify the smallest relevant set of files. Use the graph to understand:

- Existing architecture and module boundaries.
- Backend Entity, DTO, DAO, Repository, Service, and Controller patterns.
- React route structure and page/component ownership.
- Axios service usage and shared API configuration.
- Authentication and JWT flow.
- Liquibase migrations, seed data, and database schema.

For every new feature, Codex should:

1. Query Graphify for related files.
2. Read only the most relevant files from the graph result.
3. Reuse existing frontend and backend patterns.
4. Avoid duplicate APIs, services, DTOs, entities, pages, and files.
5. Preserve existing authentication and authorization behavior.
6. Summarize changed files after implementation.

## Example Project Memory Queries

```powershell
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "What files implement JWT authentication?"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "Which React pages call preventiveMaintenanceService?"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "Show the Entity DTO DAO Repository Service Controller pattern for Equipment"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "Where are React routes defined and protected?"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "Which Liquibase changesets define preventive maintenance tables?"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" query "How does axios attach authentication headers?"
& "$env:APPDATA\Python\Python314\Scripts\graphify.exe" path "PreventiveMaintenancePage" "PreventiveMaintenanceScheduleController"
```
