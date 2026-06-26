package com.example.cmmsApplication.common.security.dto;

public class AllowedSiteDTO {
    private Long siteId;
    private String siteCode;
    private String siteName;

    public AllowedSiteDTO() {
    }

    public AllowedSiteDTO(Long siteId, String siteCode, String siteName) {
        this.siteId = siteId;
        this.siteCode = siteCode;
        this.siteName = siteName;
    }

    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
}




