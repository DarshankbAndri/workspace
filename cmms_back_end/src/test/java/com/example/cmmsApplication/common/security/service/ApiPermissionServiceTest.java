package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import com.example.cmmsApplication.common.security.repository.PermissionApiMappingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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
        securityProperties.setPublicApiPatterns(List.of("/api/auth/**"));
        apiPermissionService = new ApiPermissionService(permissionApiMappingRepository, securityProperties);
    }

    @Test
    void publicApiIsAllowedWithoutRepositoryLookup() {
        assertTrue(apiPermissionService.hasPermission("10", "/api/auth/me", "GET"));

        verifyNoInteractions(permissionApiMappingRepository);
    }

    @Test
    void unmappedApiIsDeniedWhenDenyUnmappedIsEnabled() {
        securityProperties.setDenyUnmappedApi(true);
        when(permissionApiMappingRepository.hasActiveMapping("/api/equipment", "GET")).thenReturn(false);

        assertFalse(apiPermissionService.hasPermission("10", "/api/equipment", "GET"));

        verify(permissionApiMappingRepository, never()).hasPermission("10", "/api/equipment", "GET");
    }

    @Test
    void unmappedApiIsAllowedWhenDenyUnmappedIsDisabled() {
        securityProperties.setDenyUnmappedApi(false);
        when(permissionApiMappingRepository.hasActiveMapping("/api/equipment", "GET")).thenReturn(false);

        assertTrue(apiPermissionService.hasPermission("10", "/api/equipment", "GET"));

        verify(permissionApiMappingRepository, never()).hasPermission("10", "/api/equipment", "GET");
    }

    @Test
    void mappedApiUsesRepositoryDecision() {
        when(permissionApiMappingRepository.hasActiveMapping("/api/equipment", "GET")).thenReturn(true);
        when(permissionApiMappingRepository.hasPermission("10", "/api/equipment", "GET")).thenReturn(true);

        assertTrue(apiPermissionService.hasPermission("10", "/api/equipment", "GET"));
    }
}
