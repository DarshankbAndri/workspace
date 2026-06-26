package com.example.cmmsApplication.dto;

public class EmployeeRoleAssignmentDTO {
    private Long userRoleId;
    private Long userId;
    private Long roleId;
    private String roleCode;
    private String roleName;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private String status;

    public Long getUserRoleId() { return userRoleId; }
    public void setUserRoleId(Long userRoleId) { this.userRoleId = userRoleId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
