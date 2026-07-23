package com.example.cmmsApplication.common.config;


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
    private boolean denyUnmappedApi = true;
    private String publicApiPatternsXml = "classpath:public-api-patterns.xml";

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

    public String getPublicApiPatternsXml() {
        return publicApiPatternsXml;
    }

    public void setPublicApiPatternsXml(String publicApiPatternsXml) {
        this.publicApiPatternsXml = publicApiPatternsXml;
    }

    @PostConstruct
    public void logConfiguration() {
        logger.info("CMMS API permission restriction enabled: {}", apiPermissionRestrictionEnabled);
        logger.info("CMMS deny unmapped API enabled: {}", denyUnmappedApi);
        logger.info("CMMS public API patterns XML: {}", publicApiPatternsXml);
        if (!apiPermissionRestrictionEnabled) {
            logger.warn("WARNING: Backend API permission checks are disabled. Site access filtering remains enabled.");
        }
    }
}
