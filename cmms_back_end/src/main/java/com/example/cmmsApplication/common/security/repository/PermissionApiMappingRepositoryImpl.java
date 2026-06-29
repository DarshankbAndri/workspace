package com.example.cmmsApplication.common.security.repository;

import com.example.cmmsApplication.common.security.entity.PermissionApiMapping;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Repository;
import org.springframework.util.AntPathMatcher;

@Repository
public class PermissionApiMappingRepositoryImpl implements PermissionApiMappingRepositoryCustom {
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public boolean hasPermission(String userId, String requestUrl, String httpMethod) {
        List<PermissionApiMapping> mappings = entityManager.createQuery("""
                        SELECT mapping
                        FROM PermissionApiMapping mapping
                        WHERE mapping.active = true
                          AND UPPER(mapping.httpMethod) = :httpMethod
                          AND mapping.permissionCode IN (
                              SELECT permission.permissionCode
                              FROM UserRoleAssignment assignment
                              JOIN assignment.role role
                              JOIN RolePermission rolePermission ON rolePermission.role = role
                              JOIN rolePermission.permission permission
                              WHERE assignment.user.id = :userId
                                AND UPPER(assignment.status) = 'ACTIVE'
                                AND UPPER(permission.status) = 'ACTIVE'
                          )
                        """, PermissionApiMapping.class)
                .setParameter("userId", Long.valueOf(userId))
                .setParameter("httpMethod", normalizeMethod(httpMethod))
                .getResultList();
        return mappings.stream().anyMatch((mapping) -> matches(mapping.getApiPath(), requestUrl));
    }

    @Override
    public boolean hasActiveMapping(String requestUrl, String httpMethod) {
        List<PermissionApiMapping> mappings = entityManager.createQuery("""
                        SELECT mapping
                        FROM PermissionApiMapping mapping
                        WHERE mapping.active = true
                          AND UPPER(mapping.httpMethod) = :httpMethod
                        """, PermissionApiMapping.class)
                .setParameter("httpMethod", normalizeMethod(httpMethod))
                .getResultList();
        return mappings.stream().anyMatch((mapping) -> matches(mapping.getApiPath(), requestUrl));
    }

    private boolean matches(String apiPath, String requestUrl) {
        String pattern = normalizePath(apiPath);
        String path = normalizePath(requestUrl);
        return pathMatcher.match(pattern, path);
    }

    private String normalizeMethod(String httpMethod) {
        return httpMethod == null ? "" : httpMethod.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizePath(String value) {
        if (value == null || value.isBlank()) {
            return "/";
        }
        String normalized = value.trim().replace('\\', '/');
        normalized = normalized.replaceAll("\\{[^/]+}", "*");
        return normalized.startsWith("/") ? normalized : "/" + normalized;
    }
}
