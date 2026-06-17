package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.RolePermissionDAO;
import com.example.cmmsApplication.dao.UserRoleAssignmentDAO;
import com.example.cmmsApplication.config.CmmsSecurityProperties;
import com.example.cmmsApplication.dto.AllowedSiteDTO;
import com.example.cmmsApplication.dto.AuthAccessDTO;
import com.example.cmmsApplication.dto.UserDTO;
import com.example.cmmsApplication.entity.EmployeeSiteAssignment;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.entity.UserRole;
import com.example.cmmsApplication.entity.UserRoleAssignment;
import com.example.cmmsApplication.exception.UnauthorizedAccessException;
import com.example.cmmsApplication.repository.EmployeeSiteAssignmentRepository;
import com.example.cmmsApplication.repository.SiteRepository;
import com.example.cmmsApplication.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AccessControlService {
    private static final Set<String> ALL_PERMISSION_CODES = Set.of(
            "DASHBOARD_VIEW",
            "SITE_VIEW", "SITE_CREATE", "SITE_UPDATE", "SITE_DELETE",
            "EMPLOYEE_VIEW", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE", "EMPLOYEE_DELETE",
            "EQUIPMENT_VIEW", "EQUIPMENT_CREATE", "EQUIPMENT_UPDATE", "EQUIPMENT_DELETE",
            "VENDOR_VIEW", "VENDOR_CREATE", "VENDOR_UPDATE", "VENDOR_DELETE",
            "REQUEST_VIEW", "REQUEST_CREATE", "REQUEST_UPDATE", "REQUEST_DELETE",
            "ASSIGNMENT_VIEW", "ASSIGNMENT_CREATE", "ASSIGNMENT_UPDATE", "ASSIGNMENT_DELETE",
            "DOWNTIME_VIEW", "DOWNTIME_CREATE", "DOWNTIME_UPDATE", "DOWNTIME_DELETE",
            "REPORT_VIEW",
            "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
            "PERMISSION_VIEW", "USER_ROLE_VIEW", "USER_ROLE_UPDATE", "USER_ROLE_ASSIGN",
            "APPROVAL_VIEW", "APPROVAL_APPROVE", "APPROVAL_REJECT",
            "APPROVAL_CONFIG_VIEW", "APPROVAL_CONFIG_UPDATE",
            "NOTIFICATION_VIEW", "NOTIFICATION_UPDATE"
    );

    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final EmployeeSiteAssignmentRepository employeeSiteAssignmentRepository;
    private final UserRoleAssignmentDAO userRoleAssignmentDAO;
    private final RolePermissionDAO rolePermissionDAO;
    private final CmmsSecurityProperties cmmsSecurityProperties;

    public AccessControlService(UserRepository userRepository,
                                SiteRepository siteRepository,
                                EmployeeSiteAssignmentRepository employeeSiteAssignmentRepository,
                                UserRoleAssignmentDAO userRoleAssignmentDAO,
                                RolePermissionDAO rolePermissionDAO,
                                CmmsSecurityProperties cmmsSecurityProperties) {
        this.userRepository = userRepository;
        this.siteRepository = siteRepository;
        this.employeeSiteAssignmentRepository = employeeSiteAssignmentRepository;
        this.userRoleAssignmentDAO = userRoleAssignmentDAO;
        this.rolePermissionDAO = rolePermissionDAO;
        this.cmmsSecurityProperties = cmmsSecurityProperties;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("Authentication is required");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UnauthorizedAccessException("Authenticated user not found"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public Long getCurrentEmployeeId() {
        User user = getCurrentUser();
        return user.getEmployee() == null ? null : user.getEmployee().getId();
    }

    public List<Long> getAllowedSiteIds() {
        if (isAdmin()) {
            return siteRepository.findAll().stream().map(Site::getId).collect(Collectors.toList());
        }
        User user = getCurrentUser();
        Set<Long> siteIds = new LinkedHashSet<>();
        for (UserRoleAssignment assignment : userRoleAssignmentDAO.findActiveByUserId(user.getId())) {
            if (assignment.getSite() != null) {
                siteIds.add(assignment.getSite().getId());
            }
        }
        if (user.getEmployee() != null) {
            employeeSiteAssignmentRepository.findByEmployeeId(user.getEmployee().getId()).stream()
                    .filter((assignment) -> !"INACTIVE".equalsIgnoreCase(assignment.getStatus()))
                    .map(EmployeeSiteAssignment::getSite)
                    .filter(Objects::nonNull)
                    .map(Site::getId)
                    .forEach(siteIds::add);
        }
        if (siteIds.isEmpty()) {
            return siteRepository.findAll().stream().map(Site::getId).collect(Collectors.toList());
        }
        return new ArrayList<>(siteIds);
    }

    public List<AllowedSiteDTO> getAllowedSites() {
        List<Long> ids = getAllowedSiteIds();
        if (ids.isEmpty()) {
            return Collections.emptyList();
        }
        return siteRepository.findAllById(ids).stream()
                .map((site) -> new AllowedSiteDTO(site.getId(), site.getSiteCode(), site.getSiteName()))
                .collect(Collectors.toList());
    }

    public boolean hasPermission(String permissionCode) {
        if (!cmmsSecurityProperties.isApiPermissionRestrictionEnabled()) {
            return true;
        }
        return getPermissions().contains(permissionCode);
    }

    public boolean hasAnyPermission(Collection<String> permissionCodes) {
        if (!cmmsSecurityProperties.isApiPermissionRestrictionEnabled()) {
            return true;
        }
        Set<String> current = getPermissions();
        return permissionCodes.stream().anyMatch(current::contains);
    }

    public void validatePermission(String permissionCode) {
        if (!hasPermission(permissionCode)) {
            throw new UnauthorizedAccessException("Missing permission: " + permissionCode);
        }
    }

    public void validateSiteAccess(Long siteId) {
        if (siteId == null || isAdmin()) {
            return;
        }
        if (!getAllowedSiteIds().contains(siteId)) {
            throw new UnauthorizedAccessException("You do not have access to site: " + siteId);
        }
    }

    public void validateAnySiteAccess(Collection<Long> siteIds) {
        if (siteIds == null || siteIds.isEmpty() || isAdmin()) {
            return;
        }
        List<Long> allowedSiteIds = getAllowedSiteIds();
        for (Long siteId : siteIds) {
            if (!allowedSiteIds.contains(siteId)) {
                throw new UnauthorizedAccessException("You do not have access to site: " + siteId);
            }
        }
    }

    public boolean isSuperAdmin() {
        return getRoles().contains("SUPER_ADMIN");
    }

    public boolean isAdmin() {
        Set<String> roles = getRoles();
        User user = getCurrentUser();
        return roles.contains("SUPER_ADMIN") || roles.contains("ADMIN") || user.getRole() == UserRole.ADMIN;
    }

    public Set<String> getRoles() {
        User user = getCurrentUser();
        Set<String> roles = userRoleAssignmentDAO.findActiveByUserId(user.getId()).stream()
                .map((assignment) -> assignment.getRole() == null ? null : assignment.getRole().getRoleCode())
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (roles.isEmpty()) {
            roles.addAll(legacyRoles(user.getRole()));
        }
        return roles;
    }

    public Set<String> getPermissions() {
        Set<String> roles = getRoles();
        if (roles.contains("SUPER_ADMIN") || roles.contains("ADMIN")) {
            return new LinkedHashSet<>(ALL_PERMISSION_CODES);
        }
        Set<String> mapped = rolePermissionDAO.findByRoleCodes(roles).stream()
                .map((rolePermission) -> rolePermission.getPermission() == null ? null : rolePermission.getPermission().getPermissionCode())
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (mapped.isEmpty()) {
            mapped.addAll(legacyPermissions(getCurrentUser().getRole()));
        }
        return mapped;
    }

    public AuthAccessDTO buildAccessPayload(User user) {
        AuthAccessDTO dto = new AuthAccessDTO();
        dto.setUser(toUserDTO(user));
        dto.setRoles(new ArrayList<>(getRolesFor(user)));
        dto.setPermissions(new ArrayList<>(getPermissionsFor(user)));
        dto.setAllowedSites(getAllowedSitesFor(user));
        return dto;
    }

    private Set<String> getRolesFor(User user) {
        Set<String> roles = userRoleAssignmentDAO.findActiveByUserId(user.getId()).stream()
                .map((assignment) -> assignment.getRole() == null ? null : assignment.getRole().getRoleCode())
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (roles.isEmpty()) {
            roles.addAll(legacyRoles(user.getRole()));
        }
        return roles;
    }

    private Set<String> getPermissionsFor(User user) {
        Set<String> roles = getRolesFor(user);
        if (roles.contains("SUPER_ADMIN") || roles.contains("ADMIN") || user.getRole() == UserRole.ADMIN) {
            return new LinkedHashSet<>(ALL_PERMISSION_CODES);
        }
        Set<String> mapped = rolePermissionDAO.findByRoleCodes(roles).stream()
                .map((rolePermission) -> rolePermission.getPermission() == null ? null : rolePermission.getPermission().getPermissionCode())
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (mapped.isEmpty()) {
            mapped.addAll(legacyPermissions(user.getRole()));
        }
        return mapped;
    }

    private List<AllowedSiteDTO> getAllowedSitesFor(User user) {
        if (user.getRole() == UserRole.ADMIN || getRolesFor(user).stream().anyMatch((role) -> role.equals("ADMIN") || role.equals("SUPER_ADMIN"))) {
            return siteRepository.findAll().stream()
                    .map((site) -> new AllowedSiteDTO(site.getId(), site.getSiteCode(), site.getSiteName()))
                    .collect(Collectors.toList());
        }
        Set<Long> ids = new LinkedHashSet<>();
        userRoleAssignmentDAO.findActiveByUserId(user.getId()).stream()
                .map(UserRoleAssignment::getSite)
                .filter(Objects::nonNull)
                .map(Site::getId)
                .forEach(ids::add);
        if (user.getEmployee() != null) {
            employeeSiteAssignmentRepository.findByEmployeeId(user.getEmployee().getId()).stream()
                    .filter((assignment) -> !"INACTIVE".equalsIgnoreCase(assignment.getStatus()))
                    .map(EmployeeSiteAssignment::getSite)
                    .filter(Objects::nonNull)
                    .map(Site::getId)
                    .forEach(ids::add);
        }
        if (ids.isEmpty()) {
            return siteRepository.findAll().stream()
                    .map((site) -> new AllowedSiteDTO(site.getId(), site.getSiteCode(), site.getSiteName()))
                    .collect(Collectors.toList());
        }
        return siteRepository.findAllById(ids).stream()
                .map((site) -> new AllowedSiteDTO(site.getId(), site.getSiteCode(), site.getSiteName()))
                .collect(Collectors.toList());
    }

    private Set<String> legacyRoles(UserRole role) {
        if (role == UserRole.ADMIN) {
            return Set.of("ADMIN");
        }
        if (role == UserRole.HR) {
            return Set.of("HR_ADMIN");
        }
        if (role == UserRole.MANAGER) {
            return Set.of("MAINTENANCE_MANAGER");
        }
        return Set.of("TECHNICIAN");
    }

    private Set<String> legacyPermissions(UserRole role) {
        if (role == UserRole.HR) {
            return Set.of("DASHBOARD_VIEW", "SITE_VIEW", "SITE_CREATE", "SITE_UPDATE", "EMPLOYEE_VIEW", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE");
        }
        if (role == UserRole.MANAGER) {
            return Set.of("DASHBOARD_VIEW", "EQUIPMENT_VIEW", "VENDOR_VIEW", "REQUEST_VIEW", "REQUEST_CREATE", "REQUEST_UPDATE",
                    "ASSIGNMENT_VIEW", "ASSIGNMENT_CREATE", "ASSIGNMENT_UPDATE", "DOWNTIME_VIEW", "DOWNTIME_CREATE", "DOWNTIME_UPDATE",
                    "REPORT_VIEW", "APPROVAL_VIEW", "APPROVAL_APPROVE", "APPROVAL_REJECT");
        }
        return Set.of("DASHBOARD_VIEW", "EQUIPMENT_VIEW", "REQUEST_VIEW", "REQUEST_UPDATE", "DOWNTIME_VIEW", "DOWNTIME_CREATE");
    }

    private UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getDepartment(),
                user.getManager() == null ? null : user.getManager().getId(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getActive()
        );
        dto.setEmployeeId(user.getEmployee() == null ? null : user.getEmployee().getId());
        return dto;
    }
}
