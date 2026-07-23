package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PublicApiPatternServiceTest {

    @Test
    void loadsPublicApiPatternsFromXml() {
        PublicApiPatternService service = service();

        assertTrue(service.getPatterns().contains("/api/auth/**"));
        assertTrue(service.isPublicApi("/api/auth/login"));
        assertTrue(service.isPublicApi("/api/swagger-ui/index.html"));
    }

    @Test
    void securityMatchersAlsoIncludeContextPathStrippedPatterns() {
        PublicApiPatternService service = service();
        List<String> matchers = List.of(service.getSecurityMatcherPatterns());

        assertTrue(matchers.contains("/api/auth/**"));
        assertTrue(matchers.contains("/auth/**"));
    }

    private PublicApiPatternService service() {
        PublicApiPatternService service =
                new PublicApiPatternService(new CmmsSecurityProperties(), new DefaultResourceLoader());
        service.loadPatterns();
        return service;
    }
}
