package com.example.cmmsApplication.common.config;


import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "cmms.security")
public class CmmsSecurityProperties {
    private static final Logger logger = LoggerFactory.getLogger(CmmsSecurityProperties.class);

    private boolean apiPermissionRestrictionEnabled = true;
    private boolean denyUnmappedApi = true;
    private List<String> publicApiPatterns = new ArrayList<>(List.of(
            "/api/auth/**",
            "/api/actuator/**",
            "/api/swagger-ui/**",
            "/api/v3/api-docs/**",
            "/api/company/logo/**",
            "/api/error",
            "/auth/**",
            "/actuator/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/company/logo/**",
            "/error"
    ));

    public boolean isApiPermissionRestrictionEnabled() {
        return apiPermissionRestrictionEnabled;
    }

    public void setApiPermissionRestrictionEnabled(boolean apiPermissionRestrictionEnabled) {
        this.apiPermissionRestrictionEnabled = apiPermissionRestrictionEnabled;
    }

    public boolean isDenyUnmappedApi() {
        return denyUnmappedApi;
    }

    public void setDenyUnmappedApi(boolean denyUnmappedApi) {
        this.denyUnmappedApi = denyUnmappedApi;
    }

    public List<String> getPublicApiPatterns() {
        return publicApiPatterns;
    }

    public void setPublicApiPatterns(List<String> publicApiPatterns) {
        this.publicApiPatterns = publicApiPatterns == null ? new ArrayList<>() : publicApiPatterns;
    }

    @PostConstruct
    public void logConfiguration() {
        logger.info("CMMS API permission restriction enabled: {}", apiPermissionRestrictionEnabled);
        logger.info("CMMS deny unmapped API enabled: {}", denyUnmappedApi);
        logger.info("CMMS public API patterns: {}", publicApiPatterns);
        if (!apiPermissionRestrictionEnabled) {
            logger.warn("WARNING: Backend API permission checks are disabled. Site access filtering remains enabled.");
        }
    }
}
