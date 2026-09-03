package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.util.AntPathMatcher;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiPermissionMappingCsvCoverageTest {
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Test
    void csvHasNoDuplicatePermissionPathMethodRows() {
        Set<String> seen = new HashSet<>();
        List<String> duplicates = mappings().stream()
                .map((mapping) -> mapping.permissionCode() + "|" + mapping.apiPath() + "|" + mapping.httpMethod())
                .filter((key) -> !seen.add(key))
                .toList();

        assertTrue(duplicates.isEmpty(), "Duplicate API permission mapping rows: " + duplicates);
    }

    @Test
    void everyUiApiEndpointHasAtLeastOneMappingOrIsPublic() {
        ApiPermissionService service = apiPermissionService();
        List<String> missing = uiEndpoints().stream()
                .filter((endpoint) -> !service.isPublicApi(endpoint.path()))
                .filter((endpoint) -> !isMapped(endpoint.method(), endpoint.path()))
                .map((endpoint) -> endpoint.method() + " " + endpoint.path())
                .toList();

        assertTrue(missing.isEmpty(), "Missing API permission mapping rows: " + missing);
    }

    @Test
    void representativePagePermissionsAllowExpectedApis() {
        assertAllowed("DASHBOARD_VIEW", "GET", "/api/dashboard/summary");
        assertAllowed("VENDOR_VIEW", "GET", "/api/vendors");
        assertAllowed("VENDOR_VIEW", "POST", "/api/vendors/search");
        assertAllowed("VENDOR_CREATE", "GET", "/api/hr/sites");
        assertAllowed("VENDOR_CREATE", "POST", "/api/vendors");
        assertAllowed("EQUIPMENT_CREATE", "GET", "/api/hr/sites");
        assertAllowed("EQUIPMENT_CREATE", "POST", "/api/equipment");
        assertAllowed("REQUEST_VIEW", "GET", "/api/maintenance/requests");
        assertAllowed("ASSIGNMENT_VIEW", "POST", "/api/maintenance/assignments/my/search");
        assertAllowed("APPROVAL_VIEW", "POST", "/api/approvals/pending/search");
        assertAllowed("ASSIGNMENT_CHECKLIST_VIEW", "GET", "/api/maintenance/assignments/1/checklist");
        assertAllowed("ASSIGNMENT_WORK_LOG_VIEW", "GET", "/api/maintenance/assignments/1/work-logs");
        assertAllowed("SPARE_USAGE_VIEW", "GET", "/api/maintenance/assignments/1/spares");
        assertAllowed("NOTIFICATION_VIEW", "GET", "/api/notifications");
    }

    @Test
    void representativeUnassignedPermissionsAreBlockedByCsvContract() {
        assertDenied("DASHBOARD_VIEW", "GET", "/api/vendors");
        assertDenied("DASHBOARD_VIEW", "GET", "/api/equipment");
        assertDenied("VENDOR_VIEW", "POST", "/api/vendors");
        assertDenied("VENDOR_VIEW", "PUT", "/api/vendors/1");
        assertDenied("VENDOR_VIEW", "DELETE", "/api/vendors/1");
        assertDenied("VENDOR_VIEW", "GET", "/api/equipment");
        assertDenied("REQUEST_VIEW", "POST", "/api/maintenance/requests");
        assertDenied("ASSIGNMENT_VIEW", "PUT", "/api/maintenance/assignments/1");
    }

    @Test
    void publicApiPatternsCoverSecurityPublicEndpoints() {
        ApiPermissionService service = apiPermissionService();

        assertTrue(service.isPublicApi("/api/auth/login"));
        assertTrue(service.isPublicApi("/api/auth/me"));
        assertTrue(service.isPublicApi("/api/auth/change-password"));
        assertTrue(service.isPublicApi("/api/actuator/health"));
        assertTrue(service.isPublicApi("/api/swagger-ui/index.html"));
        assertTrue(service.isPublicApi("/api/swagger-ui.html"));
        assertTrue(service.isPublicApi("/api/v3/api-docs"));
        assertTrue(service.isPublicApi("/api/company/logo/logo.png"));
    }

    private static ApiPermissionService apiPermissionService() {
        CmmsSecurityProperties securityProperties = new CmmsSecurityProperties();
        PublicApiPatternService publicApiPatternService =
                new PublicApiPatternService(securityProperties, new DefaultResourceLoader());
        publicApiPatternService.loadPatterns();
        return new ApiPermissionService(null, securityProperties, publicApiPatternService);
    }

    private static boolean isMapped(String method, String path) {
        return mappings().stream().anyMatch((mapping) -> matches(mapping, method, path));
    }

    private static void assertAllowed(String permissionCode, String method, String path) {
        assertTrue(isAllowed(permissionCode, method, path),
                () -> permissionCode + " should allow " + method + " " + path);
    }

    private static void assertDenied(String permissionCode, String method, String path) {
        assertFalse(isAllowed(permissionCode, method, path),
                () -> permissionCode + " should not allow " + method + " " + path);
    }

    private static boolean isAllowed(String permissionCode, String method, String path) {
        return mappings().stream()
                .filter((mapping) -> mapping.permissionCode().equals(permissionCode))
                .anyMatch((mapping) -> matches(mapping, method, path));
    }

    private static boolean matches(Mapping mapping, String method, String path) {
        return mapping.httpMethod().equals(method.toUpperCase(Locale.ROOT))
                && PATH_MATCHER.match(mapping.apiPath(), path);
    }

    private static List<Mapping> mappings() {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                ApiPermissionMappingCsvCoverageTest.class.getClassLoader()
                        .getResourceAsStream("api-permission-mapping.csv"),
                StandardCharsets.UTF_8))) {
            return reader.lines()
                    .skip(1)
                    .filter((line) -> !line.isBlank())
                    .map((line) -> line.split(",", 4))
                    .map((columns) -> new Mapping(
                            columns[0].trim(),
                            columns[1].trim(),
                            columns[2].trim().toUpperCase(Locale.ROOT)
                    ))
                    .toList();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read api-permission-mapping.csv", ex);
        }
    }

    private static List<Endpoint> uiEndpoints() {
        List<Endpoint> endpoints = new ArrayList<>();
        Stream.of(
                "GET /api/auth/me",
                "POST /api/auth/login",
                "POST /api/auth/change-password",
                "GET /api/admin/roles",
                "POST /api/admin/roles/search",
                "GET /api/admin/roles/1",
                "POST /api/admin/roles",
                "PUT /api/admin/roles/1",
                "DELETE /api/admin/roles/1",
                "GET /api/admin/permissions",
                "GET /api/admin/permissions/grouped",
                "GET /api/admin/users/1/roles",
                "PUT /api/admin/users/1/roles",
                "GET /api/users",
                "GET /api/users/1",
                "POST /api/users",
                "PUT /api/users/1",
                "GET /api/dashboard/summary",
                "GET /api/company/current",
                "GET /api/company/1",
                "POST /api/company/create",
                "PUT /api/company/update/1",
                "POST /api/company/upload-logo",
                "GET /api/hr/sites",
                "POST /api/hr/sites/search",
                "GET /api/hr/sites/1",
                "POST /api/hr/sites",
                "PUT /api/hr/sites/1",
                "DELETE /api/hr/sites/1",
                "GET /api/hr/employees",
                "POST /api/hr/employees/search",
                "GET /api/hr/employees/1",
                "POST /api/hr/employees",
                "PUT /api/hr/employees/1",
                "DELETE /api/hr/employees/1",
                "GET /api/vendors",
                "POST /api/vendors/search",
                "GET /api/vendors/1",
                "POST /api/vendors",
                "PUT /api/vendors/1",
                "DELETE /api/vendors/1",
                "GET /api/equipment",
                "POST /api/equipment/search",
                "GET /api/equipment/1",
                "POST /api/equipment",
                "PUT /api/equipment/1",
                "DELETE /api/equipment/1",
                "GET /api/maintenance/requests",
                "POST /api/maintenance/requests/search",
                "GET /api/maintenance/requests/1",
                "POST /api/maintenance/requests",
                "PUT /api/maintenance/requests/1",
                "DELETE /api/maintenance/requests/1",
                "GET /api/preventive-maintenance/schedules",
                "POST /api/preventive-maintenance/schedules/search",
                "GET /api/preventive-maintenance/schedules/1",
                "POST /api/preventive-maintenance/schedules",
                "PUT /api/preventive-maintenance/schedules/1",
                "DELETE /api/preventive-maintenance/schedules/1",
                "GET /api/preventive-maintenance/schedules/upcoming",
                "POST /api/preventive-maintenance/schedules/1/generate-work-order",
                "POST /api/preventive-maintenance/schedules/generate-due-work-orders",
                "GET /api/maintenance/assignments",
                "POST /api/maintenance/assignments/search",
                "GET /api/maintenance/assignments/my",
                "POST /api/maintenance/assignments/my/search",
                "GET /api/maintenance/assignments/1",
                "POST /api/maintenance/assignments",
                "PUT /api/maintenance/assignments/1",
                "DELETE /api/maintenance/assignments/1",
                "GET /api/maintenance/assignments/1/checklist",
                "POST /api/maintenance/assignments/1/checklist",
                "PUT /api/maintenance/assignments/1/checklist/2",
                "DELETE /api/maintenance/assignments/1/checklist/2",
                "POST /api/maintenance/assignments/1/checklist/2/proof",
                "GET /api/maintenance/assignments/1/checklist/2/proof/3",
                "DELETE /api/maintenance/assignments/1/checklist/2/proof/3",
                "GET /api/maintenance/assignments/1/work-logs",
                "POST /api/maintenance/assignments/1/work-logs",
                "PUT /api/maintenance/assignments/1/work-logs/2",
                "DELETE /api/maintenance/assignments/1/work-logs/2",
                "POST /api/maintenance/assignments/1/work-logs/2/attachments",
                "GET /api/maintenance/assignments/1/work-logs/2/attachments/3",
                "DELETE /api/maintenance/assignments/1/work-logs/2/attachments/3",
                "GET /api/maintenance/downtime",
                "POST /api/maintenance/downtime/search",
                "GET /api/maintenance/downtime/1",
                "POST /api/maintenance/downtime",
                "PUT /api/maintenance/downtime/1",
                "DELETE /api/maintenance/downtime/1",
                "GET /api/reports/equipment-history",
                "GET /api/reports/downtime-analysis",
                "GET /api/approvals/pending",
                "POST /api/approvals/pending/search",
                "GET /api/approvals/history",
                "POST /api/approvals/history/search",
                "GET /api/approvals/1",
                "POST /api/approvals/1/approve",
                "POST /api/approvals/1/reject",
                "GET /api/admin/approval-config",
                "POST /api/admin/approval-config",
                "PUT /api/admin/approval-config/1",
                "GET /api/notifications",
                "GET /api/notifications/stream",
                "GET /api/notifications/unread-count",
                "PUT /api/notifications/1/read",
                "PUT /api/notifications/read-all",
                "PUT /api/notifications/1/archive",
                "GET /api/admin/notification-settings",
                "PUT /api/admin/notification-settings",
                "GET /api/spare-parts",
                "POST /api/spare-parts/search",
                "GET /api/spare-parts/1",
                "GET /api/spare-parts/site/1",
                "POST /api/spare-parts",
                "PUT /api/spare-parts/1",
                "DELETE /api/spare-parts/1",
                "GET /api/spare-parts/1/transactions",
                "POST /api/spare-parts/1/stock-in",
                "POST /api/spare-parts/1/adjust",
                "POST /api/spare-parts/1/transfer",
                "POST /api/spare-parts/import",
                "GET /api/spare-part-reorders",
                "POST /api/spare-part-reorders",
                "PUT /api/spare-part-reorders/1",
                "POST /api/spare-part-reorders/1/receive-stock",
                "POST /api/assignments/1/spare-requests",
                "GET /api/spare-requests",
                "GET /api/spare-requests/1",
                "POST /api/spare-requests/1/manager-approve",
                "POST /api/spare-requests/1/manager-reject",
                "POST /api/spare-requests/1/check-stock",
                "POST /api/spare-requests/1/reserve",
                "POST /api/spare-requests/1/issue",
                "POST /api/spare-requests/1/create-purchase-request",
                "POST /api/spare-requests/1/consume-return",
                "GET /api/maintenance/assignments/1/spares",
                "POST /api/maintenance/assignments/1/spares",
                "PUT /api/maintenance/assignments/1/spares/2",
                "DELETE /api/maintenance/assignments/1/spares/2",
                "POST /api/maintenance/assignments/1/spares/2/reserve",
                "POST /api/maintenance/assignments/1/spares/2/issue",
                "POST /api/maintenance/assignments/1/spares/2/consume",
                "POST /api/maintenance/assignments/1/spares/2/reject",
                "POST /api/maintenance/assignments/1/spares/2/cancel",
                "POST /api/maintenance/assignments/1/spares/2/return"
        ).map((value) -> {
            String[] parts = value.split(" ", 2);
            return new Endpoint(parts[0], parts[1]);
        }).forEach(endpoints::add);
        return endpoints;
    }

    private record Mapping(String permissionCode, String apiPath, String httpMethod) {
    }

    private record Endpoint(String method, String path) {
    }
}
