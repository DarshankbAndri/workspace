package com.example.cmmsApplication.vendor.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorSiteAssignmentDTO {
    private Long assignmentId;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteCode;
    private String siteName;
    private Boolean primarySite;
    private String status;

}
