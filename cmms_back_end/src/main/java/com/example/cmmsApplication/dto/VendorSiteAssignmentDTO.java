package com.example.cmmsApplication.dto;

import jakarta.validation.constraints.NotNull;

public class VendorSiteAssignmentDTO {
    private Long assignmentId;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteCode;
    private String siteName;
    private Boolean primarySite;
    private String status;

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public Boolean getPrimarySite() { return primarySite; }
    public void setPrimarySite(Boolean primarySite) { this.primarySite = primarySite; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
