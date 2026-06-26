package com.example.cmmsApplication.admin.dao;

import com.example.cmmsApplication.admin.entity.RolePermission;
import com.example.cmmsApplication.admin.repository.RolePermissionRepository;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
public class RolePermissionDAO {
    private final RolePermissionRepository repository;

    public RolePermissionDAO(RolePermissionRepository repository) {
        this.repository = repository;
    }

    public RolePermission save(RolePermission rolePermission) { return repository.save(rolePermission); }
    public List<RolePermission> findByRoleCodes(Collection<String> roleCodes) { return repository.findByRoleRoleCodeIn(roleCodes); }
    public List<RolePermission> findByRoleId(Long roleId) { return repository.findByRoleId(roleId); }
    public void deleteByRoleId(Long roleId) { repository.deleteByRoleId(roleId); }
    public void flush() { repository.flush(); }
}
