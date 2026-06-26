package com.example.cmmsApplication.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RoleDTO {
    private Long id;
    private String roleCode;
    private String roleName;
    private String description;
    private String status;
    private List<Long> permissionIds = new ArrayList<>();
    private List<String> permissionCodes = new ArrayList<>();
    private List<PermissionDTO> permissions = new ArrayList<>();
    private Integer permissionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRoleId() { return id; }
    public void setRoleId(Long roleId) { this.id = roleId; }
    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<Long> getPermissionIds() { return permissionIds; }
    public void setPermissionIds(List<Long> permissionIds) { this.permissionIds = permissionIds; }
    public List<String> getPermissionCodes() { return permissionCodes; }
    public void setPermissionCodes(List<String> permissionCodes) { this.permissionCodes = permissionCodes; }
    public List<PermissionDTO> getPermissions() { return permissions; }
    public void setPermissions(List<PermissionDTO> permissions) { this.permissions = permissions; }
    public Integer getPermissionCount() { return permissionCount; }
    public void setPermissionCount(Integer permissionCount) { this.permissionCount = permissionCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
