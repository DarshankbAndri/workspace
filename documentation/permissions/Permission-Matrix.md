# Permission Matrix

See section 22 of the [master documentation](../CMMS-Creation-Page-Documentation.md#22-permission-matrix) for the consolidated page matrix and [API dependency matrix](../api-reference/API-Dependency-Matrix.md) for method/path mappings.

Permission authorization is centralized in `JwtFilter` through `ApiPermissionService`. Site and record access remains a service-layer business check. Production must review `cmms.security.api-permission-restriction-enabled` before deployment.

