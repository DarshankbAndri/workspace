# Service layer

## Refactor plan

1. Keep each existing `XService` package and name as the public interface.
2. Move its business rules, dependencies, constructors, private helpers, and Spring annotations into `XServiceImpl` in a sibling `implementation` package under the same module.
3. Keep controllers, security filters, and other services dependent on the interface. Retain existing Spring bean names so name-based lookups remain compatible.
4. Preserve transaction boundaries, cache rules, scheduled jobs, application event listeners, and initialization hooks.
5. Update tests to construct implementations while declaring and mocking service contracts. Verify compilation, business behavior, Spring proxies, and the frontend build.

## Implemented structure

All 38 previously concrete services now have interfaces and implementations. The existing `SearchService` interface remains; `SearchServiceImp` is renamed to `SearchServiceImpl`, retaining its original bean name, `searchServiceImp`.

For example, `equipment/service/EquipmentService.java` declares operations, and `equipment/implementation/EquipmentServiceImpl.java` implements them. Consumers still inject `EquipmentService`. Each implementation uses an explicit `@Service` name matching the original bean name.

Interfaces contain method declarations and the existing approval workflow constants. They contain no business logic, repositories, DAO dependencies, or Spring service annotations. Transaction, cache, scheduling, event, and lifecycle annotations remain on implementation classes and methods. `NotificationSchedulerService` extends Spring's `SchedulingConfigurer` so interface-based discovery works too.

The checklist validation and response normalization helpers are instance methods on `EquipmentChecklistService`. Request and preventive maintenance implementations call their injected service rather than static implementation methods. Existing inventory operations used between spare-part services are exposed through `SparePartService`; their stock locking, validation, and transaction bodies are preserved.

This change preserves existing APIs, database queries, authorization checks, and business rules. No schema or frontend changes are required.

## Verification

Run `mvn clean install` in `cmms_back_end` and `npm ci && npm run build` in `cmms_front_end`.

The service integration tests exercise named bean lookup, permission expressions, interface-based transaction and cache proxies, scheduled annotation discovery, and `SchedulingConfigurer` registration without requiring a database. Existing service unit tests exercise implementations through interface variables. Checklist tests cover validation, normalization, and rejection before persistence.
