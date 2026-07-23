package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import com.example.cmmsApplication.common.security.repository.PermissionApiMappingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.core.io.DefaultResourceLoader;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApiPermissionServiceTest {
    @Mock
    private PermissionApiMappingRepository permissionApiMappingRepository;

    private CmmsSecurityProperties securityProperties;
    private ApiPermissionService apiPermissionService;

    @BeforeEach
    void setUp() {
        securityProperties = new CmmsSecurityProperties();
        securityProperties.setApiPermissionRestrictionEnabled(true);
        PublicApiPatternService publicApiPatternService =
                new PublicApiPatternService(securityProperties, new DefaultResourceLoader());
        publicApiPatternService.loadPatterns();
        apiPermissionService = new ApiPermissionService(
                permissionApiMappingRepository,
                securityProperties,
                publicApiPatternService);
    }

    @Test
    void publicApiIsAllowedWithoutRepositoryLookup() {
        assertTrue(apiPermissionService.hasPermission("10", "/api/auth/me", "GET"));

        verifyNoInteractions(permissionApiMappingRepository);
    }

    @Test
    void unmappedApiIsDeniedWhenDenyUnmappedIsEnabled() {
        when(permissionApiMappingRepository.countUserPermissionsForApiPath(10L, "/api/equipment", "GET")).thenReturn(0);

        assertFalse(apiPermissionService.hasPermission("10", "/api/equipment", "GET"));
    }

    @Test
    void unmappedApiIsAllowedWhenDenyUnmappedIsDisabled() {
        securityProperties.setApiPermissionRestrictionEnabled(false);

        assertTrue(apiPermissionService.hasPermission("10", "/api/equipment", "GET"));

        verifyNoInteractions(permissionApiMappingRepository);
    }

    @Test
    void mappedApiUsesRepositoryDecision() {
        when(permissionApiMappingRepository.countUserPermissionsForApiPath(10L, "/api/equipment", "GET")).thenReturn(1);

        assertTrue(apiPermissionService.hasPermission("10", "/api/equipment", "GET"));
    }
}
