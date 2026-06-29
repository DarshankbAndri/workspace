package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import com.example.cmmsApplication.common.security.repository.PermissionApiMappingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.AntPathMatcher;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiPermissionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiPermissionService.class);

    private final PermissionApiMappingRepository permissionApiMappingRepository;
    private final CmmsSecurityProperties securityProperties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Cacheable(value = "api-permissions", key = "#userId + '|' + #httpMethod + '|' + #requestUrl")
    public boolean hasPermission(String userId, String requestUrl, String httpMethod) {
        if (!securityProperties.isApiPermissionRestrictionEnabled()) {
            LOGGER.info("[API_PERMISSION_CHECK] userId={} method={} url={} result=ALLOWED reason=DISABLED",
                    userId, httpMethod, requestUrl);
            return true;
        }
        if (isPublicApi(requestUrl)) {
            LOGGER.info("[API_PERMISSION_CHECK] userId={} method={} url={} result=ALLOWED reason=PUBLIC",
                    userId, httpMethod, requestUrl);
            return true;
        }

        boolean allowed = hasPermission(Long.valueOf(userId), requestUrl,httpMethod);
        LOGGER.info("[API_PERMISSION_CHECK] userId={} method={} url={} result={}",
                userId, httpMethod, requestUrl, allowed ? "ALLOWED" : "DENIED");
        return allowed;
    }


     public boolean hasPermission(Long userId, String requestUrl, String httpMethod) {
        Integer count = permissionApiMappingRepository.countUserPermissionsForApiPath(userId, requestUrl,httpMethod);
        boolean allowed = count > 0;
        return allowed;
    }


    public boolean isPublicApi(String requestUrl) {
        String path = normalizePath(requestUrl);
        return securityProperties.getPublicApiPatterns().stream()
                .map(this::normalizePath)
                .anyMatch((pattern) -> pathMatcher.match(pattern, path));
    }

    private String normalizePath(String value) {
        if (value == null || value.isBlank()) {
            return "/";
        }
        String normalized = value.trim().replace('\\', '/');
        return normalized.startsWith("/") ? normalized : "/" + normalized;
    }
}
