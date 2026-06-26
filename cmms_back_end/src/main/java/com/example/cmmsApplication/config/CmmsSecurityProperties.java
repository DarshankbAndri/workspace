package com.example.cmmsApplication.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "cmms.security")
public class CmmsSecurityProperties {
    private static final Logger logger = LoggerFactory.getLogger(CmmsSecurityProperties.class);

    private boolean apiPermissionRestrictionEnabled = true;

    public boolean isApiPermissionRestrictionEnabled() {
        return apiPermissionRestrictionEnabled;
    }

    public void setApiPermissionRestrictionEnabled(boolean apiPermissionRestrictionEnabled) {
        this.apiPermissionRestrictionEnabled = apiPermissionRestrictionEnabled;
    }

    @PostConstruct
    public void logConfiguration() {
        logger.info("CMMS API permission restriction enabled: {}", apiPermissionRestrictionEnabled);
        if (!apiPermissionRestrictionEnabled) {
            logger.warn("WARNING: Backend API permission checks are disabled. Site access filtering remains enabled.");
        }
    }
}
