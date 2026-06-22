package com.example.cmmsApplication.admin.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.admin.dao.PermissionDAO;
import com.example.cmmsApplication.admin.dao.RoleDAO;
import com.example.cmmsApplication.admin.dao.RolePermissionDAO;
import com.example.cmmsApplication.admin.dao.UserRoleAssignmentDAO;
import com.example.cmmsApplication.admin.dto.PermissionDTO;
import com.example.cmmsApplication.admin.dto.RoleDTO;
import com.example.cmmsApplication.admin.entity.PermissionMaster;
import com.example.cmmsApplication.admin.entity.RoleMaster;
import com.example.cmmsApplication.admin.entity.RolePermission;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleService {
    private final RoleDAO roleDAO;
    private final PermissionDAO permissionDAO;
    private final RolePermissionDAO rolePermissionDAO;
    private final UserRoleAssignmentDAO userRoleAssignmentDAO;
    private final AccessControlService accessControlService;

    public RoleService(RoleDAO roleDAO, PermissionDAO permissionDAO, RolePermissionDAO rolePermissionDAO, UserRoleAssignmentDAO userRoleAssignmentDAO, AccessControlService accessControlService) {
        this.roleDAO = roleDAO;
        this.permissionDAO = permissionDAO;
        this.rolePermissionDAO = rolePermissionDAO;
        this.userRoleAssignmentDAO = userRoleAssignmentDAO;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<RoleDTO> getAll() {
        accessControlService.validatePermission("ROLE_VIEW");
        return roleDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDTO getById(Long id) {
        accessControlService.validatePermission("ROLE_VIEW");
        return toDTO(getEntity(id));
    }

    public RoleDTO create(RoleDTO dto) {
        accessControlService.validatePermission("ROLE_CREATE");
        validateRequired(dto);
        if (roleDAO.existsByRoleCode(dto.getRoleCode())) {
            throw new InvalidOperationException("Role code already exists: " + dto.getRoleCode());
        }
        RoleMaster role = new RoleMaster();
        apply(role, dto);
        RoleMaster saved = roleDAO.save(role);
        replacePermissions(saved, dto);
        return toDTO(saved);
    }

    public RoleDTO update(Long id, RoleDTO dto) {
        accessControlService.validatePermission("ROLE_UPDATE");
        validateRequired(dto);
        RoleMaster role = getEntity(id);
        if (roleDAO.existsByRoleCodeAndIdNot(dto.getRoleCode(), id)) {
            throw new InvalidOperationException("Role code already exists: " + dto.getRoleCode());
        }
        apply(role, dto);
        RoleMaster saved = roleDAO.save(role);
        replacePermissions(saved, dto);
        return toDTO(saved);
    }

    public void delete(Long id) {
        accessControlService.validatePermission("ROLE_DELETE");
        RoleMaster role = getEntity(id);
        if ("SUPER_ADMIN".equalsIgnoreCase(role.getRoleCode())) {
            throw new InvalidOperationException("SUPER_ADMIN role cannot be deleted or inactivated");
        }
        if (userRoleAssignmentDAO.existsActiveByUserIdAndRoleId(accessControlService.getCurrentUserId(), id)
                && ("ADMIN".equalsIgnoreCase(role.getRoleCode()) || "SUPER_ADMIN".equalsIgnoreCase(role.getRoleCode()))) {
            throw new InvalidOperationException("You cannot inactivate your own active admin role");
        }
        role.setStatus("INACTIVE");
        roleDAO.save(role);
    }

    public RoleMaster getEntity(Long id) {
        return roleDAO.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    private void apply(RoleMaster role, RoleDTO dto) {
        role.setRoleCode(dto.getRoleCode().trim().toUpperCase());
        role.setRoleName(dto.getRoleName().trim());
        role.setDescription(dto.getDescription());
        role.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "ACTIVE" : dto.getStatus());
    }

    private void replacePermissions(RoleMaster role, RoleDTO dto) {
        rolePermissionDAO.deleteByRoleId(role.getId());
        rolePermissionDAO.flush();
        List<PermissionMaster> selected = new ArrayList<>();
        if (dto.getPermissionIds() != null && !dto.getPermissionIds().isEmpty()) {
            Set<Long> permissionIds = new LinkedHashSet<>(dto.getPermissionIds());
            for (Long permissionId : permissionIds) {
                selected.add(permissionDAO.findById(permissionId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + permissionId)));
            }
        } else if (dto.getPermissionCodes() != null && !dto.getPermissionCodes().isEmpty()) {
            Set<String> permissionCodes = dto.getPermissionCodes().stream()
                    .filter((code) -> code != null && !code.isBlank())
                    .map((code) -> code.trim().toUpperCase())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            for (String code : permissionCodes) {
                selected.add(permissionDAO.findByPermissionCode(code)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + code)));
            }
        }
        for (PermissionMaster permission : selected) {
            RolePermission rolePermission = new RolePermission();
            rolePermission.setRole(role);
            rolePermission.setPermission(permission);
            rolePermissionDAO.save(rolePermission);
        }
    }

    private void validateRequired(RoleDTO dto) {
        if (dto.getRoleCode() == null || dto.getRoleCode().trim().isEmpty()) {
            throw new InvalidOperationException("Role code is required");
        }
        if (dto.getRoleName() == null || dto.getRoleName().trim().isEmpty()) {
            throw new InvalidOperationException("Role name is required");
        }
        if (dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
            throw new InvalidOperationException("Status is required");
        }
    }

    private RoleDTO toDTO(RoleMaster role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setRoleCode(role.getRoleCode());
        dto.setRoleName(role.getRoleName());
        dto.setDescription(role.getDescription());
        dto.setStatus(role.getStatus());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());
        List<PermissionDTO> permissions = rolePermissionDAO.findByRoleId(role.getId()).stream()
                .map((rolePermission) -> toPermissionDTO(rolePermission.getPermission()))
                .collect(Collectors.toList());
        dto.setPermissions(permissions);
        dto.setPermissionIds(permissions.stream().map(PermissionDTO::getId).collect(Collectors.toList()));
        dto.setPermissionCodes(permissions.stream().map(PermissionDTO::getPermissionCode).collect(Collectors.toList()));
        dto.setPermissionCount(permissions.size());
        return dto;
    }

    private PermissionDTO toPermissionDTO(PermissionMaster permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setPermissionCode(permission.getPermissionCode());
        dto.setPermissionName(permission.getPermissionName());
        dto.setModuleName(permission.getModuleName());
        dto.setActionName(permission.getActionName());
        dto.setStatus(permission.getStatus());
        dto.setCreatedAt(permission.getCreatedAt());
        dto.setUpdatedAt(permission.getUpdatedAt());
        return dto;
    }
}





