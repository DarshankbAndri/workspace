package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.admin.dao.RolePermissionDAO;
import com.example.cmmsApplication.admin.dao.UserRoleAssignmentDAO;
import com.example.cmmsApplication.admin.entity.PermissionMaster;
import com.example.cmmsApplication.admin.entity.RoleMaster;
import com.example.cmmsApplication.admin.entity.RolePermission;
import com.example.cmmsApplication.admin.entity.UserRoleAssignment;
import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import com.example.cmmsApplication.common.exception.UnauthorizedAccessException;
import com.example.cmmsApplication.employee.repository.EmployeeSiteAssignmentRepository;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.site.repository.SiteRepository;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.user.enums.UserRole;
import com.example.cmmsApplication.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccessControlServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private SiteRepository siteRepository;
    @Mock
    private EmployeeSiteAssignmentRepository employeeSiteAssignmentRepository;
    @Mock
    private UserRoleAssignmentDAO userRoleAssignmentDAO;
    @Mock
    private RolePermissionDAO rolePermissionDAO;

    private AccessControlService accessControlService;
    private User user;

    @BeforeEach
    void setUp() {
        CmmsSecurityProperties properties = new CmmsSecurityProperties();
        properties.setApiPermissionRestrictionEnabled(true);
        accessControlService = new AccessControlService(
                userRepository,
                siteRepository,
                employeeSiteAssignmentRepository,
                userRoleAssignmentDAO,
                rolePermissionDAO,
                properties
        );
        user = user(10L, "tech", UserRole.EMPLOYEE);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("tech", null));
        lenient().when(userRepository.findByUsername("tech")).thenReturn(Optional.of(user));
        lenient().when(rolePermissionDAO.findByRoleCodes(anyCollection())).thenReturn(List.of());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllowedSiteIdsReturnsEmptyForNonAdminWithoutAssignments() {
        when(userRoleAssignmentDAO.findActiveByUserId(user.getId())).thenReturn(List.of());

        assertEquals(List.of(), accessControlService.getAllowedSiteIds());
        assertThrows(UnauthorizedAccessException.class, () -> accessControlService.validateSiteAccess(1L));
        verify(siteRepository, never()).findAll();
    }

    @Test
    void validateSiteAccessAllowsOnlyAssignedSitesForNonAdmin() {
        Site assignedSite = site(2L, "Plant 2");
        UserRoleAssignment assignment = new UserRoleAssignment();
        assignment.setSite(assignedSite);
        when(userRoleAssignmentDAO.findActiveByUserId(user.getId())).thenReturn(List.of(assignment));

        assertEquals(List.of(2L), accessControlService.getAllowedSiteIds());
        assertDoesNotThrow(() -> accessControlService.validateSiteAccess(2L));
        assertThrows(UnauthorizedAccessException.class, () -> accessControlService.validateSiteAccess(3L));
    }

    @Test
    void adminStillGetsAllSites() {
        user.setRole(UserRole.ADMIN);
        when(userRoleAssignmentDAO.findActiveByUserId(user.getId())).thenReturn(List.of());
        when(siteRepository.findAll()).thenReturn(List.of(site(1L, "Plant 1"), site(2L, "Plant 2")));

        assertEquals(List.of(1L, 2L), accessControlService.getAllowedSiteIds());
    }

    @Test
    void explicitGlobalSiteAccessPermissionGetsAllSites() {
        RoleMaster role = role("SITE_MANAGER");
        UserRoleAssignment roleAssignment = new UserRoleAssignment();
        roleAssignment.setRole(role);
        when(userRoleAssignmentDAO.findActiveByUserId(user.getId())).thenReturn(List.of(roleAssignment));
        when(rolePermissionDAO.findByRoleCodes(anyCollection())).thenReturn(List.of(rolePermission("SITE_GLOBAL_ACCESS")));
        when(siteRepository.findAll()).thenReturn(List.of(site(1L, "Plant 1"), site(2L, "Plant 2")));

        assertEquals(List.of(1L, 2L), accessControlService.getAllowedSiteIds());
    }

    @Test
    void buildAccessPayloadReturnsNoAllowedSitesForUnassignedNonAdmin() {
        when(userRoleAssignmentDAO.findActiveByUserId(user.getId())).thenReturn(List.of());

        assertEquals(List.of(), accessControlService.buildAccessPayload(user).getAllowedSites());
        verify(siteRepository, never()).findAll();
    }

    private User user(Long id, String username, UserRole role) {
        User next = new User();
        next.setId(id);
        next.setUsername(username);
        next.setEmail(username + "@example.com");
        next.setPassword("encoded");
        next.setFirstName(username);
        next.setLastName("User");
        next.setRole(role);
        next.setDepartment("Maintenance");
        next.setActive(true);
        return next;
    }

    private Site site(Long id, String name) {
        Site site = new Site();
        site.setId(id);
        site.setSiteCode("SITE-" + id);
        site.setSiteName(name);
        return site;
    }

    private RoleMaster role(String code) {
        RoleMaster role = new RoleMaster();
        role.setRoleCode(code);
        role.setRoleName(code);
        return role;
    }

    private RolePermission rolePermission(String permissionCode) {
        PermissionMaster permission = new PermissionMaster();
        permission.setPermissionCode(permissionCode);
        permission.setPermissionName(permissionCode);
        RolePermission rolePermission = new RolePermission();
        rolePermission.setPermission(permission);
        return rolePermission;
    }
}
