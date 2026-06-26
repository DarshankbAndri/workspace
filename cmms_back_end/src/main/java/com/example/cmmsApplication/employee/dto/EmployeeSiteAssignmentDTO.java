package com.example.cmmsApplication.employee.dto;


import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EmployeeSiteAssignmentDTO {
    private Long assignmentId;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteName;
    @NotBlank(message = "Role is required")
    private String roleName;
    private Boolean primarySite;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String status;

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public Boolean getPrimarySite() { return primarySite; }
    public void setPrimarySite(Boolean primarySite) { this.primarySite = primarySite; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}





