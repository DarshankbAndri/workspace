# Liquibase Database Migration Guide

## Overview
Liquibase automatically manages all database schema changes. Every time you start the application, Liquibase compares the database with your changelog files and applies any missing changes automatically.

## Structure

```
src/main/resources/db/changelog/
├── db.changelog-master.yaml          # Master file - includes all changesets
└── changes/
    ├── 001-initial-schema.yaml       # Initial tables, enums, constraints
    └── 002-insert-sample-data.yaml   # Sample data for testing
```

## How It Works

1. **First Run**: Liquibase creates `DATABASECHANGELOG` table to track applied changes
2. **Compare**: Checks which changesets haven't been applied yet
3. **Execute**: Runs only the new changesets
4. **Track**: Records each changeset as applied
5. **Rollback**: Can rollback changes if needed

## Adding New Changes

### Example 1: Add a new column to users table

Create file: `src/main/resources/db/changelog/changes/003-add-phone-to-users.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 003-add-phone-column
      author: your-name
      changes:
        - addColumn:
            tableName: users
            columns:
              - column:
                  name: phone
                  type: VARCHAR(20)
```

### Example 2: Create a new table

Create file: `src/main/resources/db/changelog/changes/004-create-documents-table.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 004-create-documents-table
      author: your-name
      changes:
        - createTable:
            tableName: documents
            columns:
              - column:
                  name: id
                  type: BIGSERIAL
                  constraints:
                    primaryKey: true
              - column:
                  name: claim_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: file_name
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
              - column:
                  name: file_url
                  type: TEXT
              - column:
                  name: created_at
                  type: TIMESTAMP
                  defaultValueDate: NOW()
        - addForeignKeyConstraint:
            constraintName: fk_documents_claim_id
            baseTableName: documents
            baseColumnNames: claim_id
            referencedTableName: claims
            referencedColumnNames: id
```

### Example 3: Insert data

```yaml
databaseChangeLog:
  - changeSet:
      id: 005-insert-test-data
      author: your-name
      changes:
        - insert:
            tableName: users
            columns:
              - column:
                  name: username
                  value: testuser
              - column:
                  name: email
                  value: test@example.com
              - column:
                  name: password
                  value: $2a$10$...hashed_password...
              - column:
                  name: role
                  value: EMPLOYEE
              - column:
                  name: department
                  value: IT
              - column:
                  name: active
                  value: true
```

## Then add to Master File

Update `db.changelog-master.yaml`:

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/changes/001-initial-schema.yaml
  - include:
      file: db/changelog/changes/002-insert-sample-data.yaml
  - include:
      file: db/changelog/changes/003-add-phone-to-users.yaml
  - include:
      file: db/changelog/changes/004-create-documents-table.yaml
  - include:
      file: db/changelog/changes/005-insert-test-data.yaml
```

## Common Operations

### Add Column
```yaml
- addColumn:
    tableName: users
    columns:
      - column:
          name: last_login
          type: TIMESTAMP
```

### Drop Column
```yaml
- dropColumn:
    tableName: users
    columnName: deprecated_field
```

### Create Index
```yaml
- createIndex:
    indexName: idx_users_email
    tableName: users
    columns:
      - column:
          name: email
```

### Add Constraint
```yaml
- addUniqueConstraint:
    constraintName: uq_users_email
    tableName: users
    columnNames: email
```

### Rename Column
```yaml
- renameColumn:
    tableName: users
    oldColumnName: old_name
    newColumnName: new_name
    columnDataType: VARCHAR(100)
```

### Modify Column
```yaml
- modifyDataType:
    tableName: users
    columnName: department
    newDataType: VARCHAR(255)
```

## Naming Convention

Always follow this pattern for changeset files:
- `NNN-descriptive-name.yaml` where NNN is a 3-digit number (001, 002, 003, etc.)
- Use dashes instead of spaces
- Be descriptive: `003-add-audit-columns.yaml`

## Important Notes

1. **Never Edit Applied Changesets**: Once a changeset is applied, don't modify it. Create a new one instead.

2. **Test Locally First**: Always test your changelogs locally before deploying to production.

3. **Review SQL**: You can see the generated SQL in server logs:
   ```
   [LiquibaseScriptParserListener] Reading from file: db/changelog/changes/003-add-phone-to-users.yaml
   ```

4. **Rollback (Advanced)**:
   ```properties
   # In application.properties for rollback
   spring.liquibase.contexts=!production
   ```

## Migration History Table

Liquibase creates a `DATABASECHANGELOG` table that tracks all applied changes:
- `ID` - Changeset ID
- `AUTHOR` - Author name
- `FILENAME` - Changelog file
- `DATEEXECUTED` - When it was applied
- `CHECKSUM` - Prevents modification of applied changesets

## Troubleshooting

### Issue: "Checksum validation failed"
**Cause**: You modified an already-applied changeset
**Solution**: Never modify applied changesets. Create a new one.

### Issue: "Cannot acquire changelog lock"
**Cause**: Another Liquibase process is running
**Solution**: Wait for other process to finish, or manually unlock:
```sql
DELETE FROM DATABASECHANGELOGLOCK;
```

### Issue: Changes not being applied
**Solution**: 
1. Check that file is included in `db.changelog-master.yaml`
2. Verify YAML syntax (indentation is critical)
3. Check application logs for errors
4. Ensure changeset ID is unique

## Next Steps

1. ✅ Setup complete - Liquibase is running
2. Add new migration files as needed (see examples above)
3. Never modify applied changesets
4. Test migrations locally before deployment
5. For production, consider using Liquibase tagged releases

