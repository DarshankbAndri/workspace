package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.PermissionDAO;
import com.example.cmmsApplication.dao.RoleDAO;
import com.example.cmmsApplication.dao.RolePermissionDAO;
import com.example.cmmsApplication.dto.RoleDTO;
import com.example.cmmsApplication.entity.PermissionMaster;
import com.example.cmmsApplication.entity.RoleMaster;
import com.example.cmmsApplication.entity.RolePermission;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleService {
    private final RoleDAO roleDAO;
    private final PermissionDAO permissionDAO;
    private final RolePermissionDAO rolePermissionDAO;
    private final AccessControlService accessControlService;

    public RoleService(RoleDAO roleDAO, PermissionDAO permissionDAO, RolePermissionDAO rolePermissionDAO, AccessControlService accessControlService) {
        this.roleDAO = roleDAO;
        this.permissionDAO = permissionDAO;
        this.rolePermissionDAO = rolePermissionDAO;
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
        if (roleDAO.existsByRoleCode(dto.getRoleCode())) {
            throw new InvalidOperationException("Role code already exists: " + dto.getRoleCode());
        }
        RoleMaster role = new RoleMaster();
        apply(role, dto);
        RoleMaster saved = roleDAO.save(role);
        replacePermissions(saved, dto.getPermissions());
        return toDTO(saved);
    }

    public RoleDTO update(Long id, RoleDTO dto) {
        accessControlService.validatePermission("ROLE_UPDATE");
        RoleMaster role = getEntity(id);
        if (roleDAO.existsByRoleCodeAndIdNot(dto.getRoleCode(), id)) {
            throw new InvalidOperationException("Role code already exists: " + dto.getRoleCode());
        }
        apply(role, dto);
        RoleMaster saved = roleDAO.save(role);
        replacePermissions(saved, dto.getPermissions());
        return toDTO(saved);
    }

    public void delete(Long id) {
        accessControlService.validatePermission("ROLE_DELETE");
        RoleMaster role = getEntity(id);
        role.setStatus("INACTIVE");
        roleDAO.save(role);
    }

    public RoleMaster getEntity(Long id) {
        return roleDAO.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    private void apply(RoleMaster role, RoleDTO dto) {
        role.setRoleCode(dto.getRoleCode());
        role.setRoleName(dto.getRoleName());
        role.setDescription(dto.getDescription());
        role.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "ACTIVE" : dto.getStatus());
    }

    private void replacePermissions(RoleMaster role, List<String> permissionCodes) {
        rolePermissionDAO.deleteByRoleId(role.getId());
        if (permissionCodes == null) {
            return;
        }
        for (String code : permissionCodes) {
            PermissionMaster permission = permissionDAO.findByPermissionCode(code)
                    .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + code));
            RolePermission rolePermission = new RolePermission();
            rolePermission.setRole(role);
            rolePermission.setPermission(permission);
            rolePermissionDAO.save(rolePermission);
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
        dto.setPermissions(rolePermissionDAO.findByRoleId(role.getId()).stream()
                .map((rolePermission) -> rolePermission.getPermission().getPermissionCode())
                .collect(Collectors.toList()));
        return dto;
    }
}
