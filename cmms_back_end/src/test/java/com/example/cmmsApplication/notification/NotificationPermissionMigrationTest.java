package com.example.cmmsApplication.notification;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Uses a new disposable schema; never resets the application schema. */
@EnabledIfEnvironmentVariable(named = "NOTIFICATION_MIGRATION_TEST_URL", matches = ".+")
class NotificationPermissionMigrationTest {
    private static final String ALL_NOTIFICATION_PERMISSIONS = "'NOTIFICATION_VIEW', 'NOTIFICATION_UPDATE', "
            + "'NOTIFICATION_CONFIG_VIEW', 'NOTIFICATION_CONFIG_UPDATE'";

    @Test
    void freshDatabaseGrantsNotificationAccessToDefaultRoles() throws Exception {
        inDisposableSchema((schema, connection) -> {
            migrate(schema);
            assertNotificationGrants(connection);
        });
    }

    @Test
    void existingDatabaseWithMissedGrantsIsRepairedIdempotently() throws Exception {
        inDisposableSchema((schema, connection) -> {
            migrate(schema);
            int originalGrantCount = grantCount(connection);
            // Model the previous release: permissions exist, but changeSet 012 granted nothing.
            try (var statement = connection.createStatement()) {
                statement.executeUpdate("DELETE FROM role_permission WHERE permission_id IN "
                        + "(SELECT permission_id FROM permission_master WHERE permission_code IN ("
                        + ALL_NOTIFICATION_PERMISSIONS + "))");
                statement.executeUpdate("DELETE FROM databasechangelog WHERE author = 'Codex' AND id IN ("
                        + "'permission-master-011-seed-notification-before-role-grants', "
                        + "'role-permission-013-backfill-notification-permissions')");
                try (var rows = statement.executeQuery("SELECT count(*) FROM databasechangelog "
                        + "WHERE id = 'role-permission-012-seed-notification'")) {
                    assertTrue(rows.next());
                    assertEquals(1, rows.getInt(1));
                }
            }
            assertEquals(originalGrantCount - 18, grantCount(connection));

            migrate(schema);
            assertNotificationGrants(connection);
            assertEquals(originalGrantCount, grantCount(connection));

            migrate(schema);
            assertNotificationGrants(connection);
            assertEquals(originalGrantCount, grantCount(connection));
        });
    }

    private void assertNotificationGrants(Connection connection) throws Exception {
        Set<String> expected = new HashSet<>();
        for (String role : Set.of("SUPER_ADMIN", "ADMIN", "HR_ADMIN", "SITE_MANAGER",
                "MAINTENANCE_MANAGER", "TECHNICIAN", "VIEWER")) {
            expected.add(role + ":NOTIFICATION_VIEW");
            expected.add(role + ":NOTIFICATION_UPDATE");
        }
        for (String role : Set.of("SUPER_ADMIN", "ADMIN")) {
            expected.add(role + ":NOTIFICATION_CONFIG_VIEW");
            expected.add(role + ":NOTIFICATION_CONFIG_UPDATE");
        }
        Set<String> actual = new HashSet<>();
        try (var statement = connection.createStatement();
             var rows = statement.executeQuery("SELECT r.role_code, p.permission_code FROM role_permission rp "
                     + "JOIN role_master r ON r.role_id = rp.role_id "
                     + "JOIN permission_master p ON p.permission_id = rp.permission_id "
                     + "WHERE p.permission_code IN (" + ALL_NOTIFICATION_PERMISSIONS + ")")) {
            while (rows.next()) {
                actual.add(rows.getString(1) + ":" + rows.getString(2));
            }
        }
        assertEquals(expected, actual);
    }

    private int grantCount(Connection connection) throws Exception {
        try (var statement = connection.createStatement();
             var rows = statement.executeQuery("SELECT count(*) FROM role_permission")) {
            assertTrue(rows.next());
            return rows.getInt(1);
        }
    }

    private Connection connect() throws Exception {
        return DriverManager.getConnection(System.getenv("NOTIFICATION_MIGRATION_TEST_URL"),
                System.getenv().getOrDefault("SPRING_DATASOURCE_USERNAME", "postgres"),
                System.getenv().getOrDefault("SPRING_DATASOURCE_PASSWORD", "postgres"));
    }

    private void migrate(String schema) throws Exception {
        try (var connection = connect()) {
            connection.setSchema(schema);
            var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            database.setDefaultSchemaName(schema);
            database.setLiquibaseSchemaName(schema);
            try (var liquibase = new Liquibase("db/changelog/db.changelog-master.xml",
                    new ClassLoaderResourceAccessor(), database)) {
                liquibase.update(new Contexts(), new LabelExpression());
            }
        }
    }

    private void inDisposableSchema(SchemaCheck check) throws Exception {
        String schema = "notification_permissions_" + UUID.randomUUID().toString().replace("-", "");
        try (var connection = connect(); var statement = connection.createStatement()) {
            statement.execute("CREATE SCHEMA " + schema);
            connection.setSchema(schema);
            try {
                check.run(schema, connection);
            } finally {
                connection.setSchema("public");
                statement.execute("DROP SCHEMA " + schema + " CASCADE");
            }
        }
    }

    @FunctionalInterface
    private interface SchemaCheck {
        void run(String schema, Connection connection) throws Exception;
    }
}
