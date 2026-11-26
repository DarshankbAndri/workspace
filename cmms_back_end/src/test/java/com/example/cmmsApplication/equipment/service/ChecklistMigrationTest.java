package com.example.cmmsApplication.equipment.service;

import java.nio.file.Path;
import java.sql.DriverManager;
import liquibase.Liquibase;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import liquibase.resource.DirectoryResourceAccessor;
import liquibase.resource.ResourceAccessor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.junit.jupiter.api.Assertions.*;

/** Runs only against explicitly supplied disposable databases, never the application database. */
@EnabledIfEnvironmentVariable(named = "CHECKLIST_MIGRATION_TEST_URL", matches = ".+")
class ChecklistMigrationTest {
    @Test void freshSchemaAndExistingSchemaUpgrade() throws Exception {
        String baseUrl = System.getenv("CHECKLIST_MIGRATION_TEST_URL");
        migrate(baseUrl + "/checklist_fresh", new ClassLoaderResourceAccessor());
        verify(baseUrl + "/checklist_fresh");
        String baseline = System.getenv("CHECKLIST_MIGRATION_BASELINE");
        assertNotNull(baseline, "Provide the baseline resources directory for the upgrade test");
        migrate(baseUrl + "/checklist_upgrade", new DirectoryResourceAccessor(Path.of(baseline)));
        migrate(baseUrl + "/checklist_upgrade", new ClassLoaderResourceAccessor());
        verify(baseUrl + "/checklist_upgrade");
    }

    private void migrate(String url, ResourceAccessor resources) throws Exception {
        try (var connection = DriverManager.getConnection(url, "checklist_test", "")) {
            var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            try (var liquibase = new Liquibase("db/changelog/db.changelog-master.xml", resources, database)) {
                liquibase.update(new liquibase.Contexts(), new liquibase.LabelExpression());
            }
        }
    }

    private void verify(String url) throws Exception {
        try (var connection = DriverManager.getConnection(url, "checklist_test", ""); var statement = connection.createStatement()) {
            for (String table : new String[] { "equipment_checklist", "equipment_checklist_item", "request_checklist_item" }) {
                try (var rows = statement.executeQuery("SELECT count(*) FROM " + table)) { assertTrue(rows.next()); }
            }
            try (var rows = statement.executeQuery("SELECT source_request_checklist_item_id FROM maintenance_assignment_checklist_item LIMIT 0")) {
                assertEquals(1, rows.getMetaData().getColumnCount());
            }
        }
    }
}
