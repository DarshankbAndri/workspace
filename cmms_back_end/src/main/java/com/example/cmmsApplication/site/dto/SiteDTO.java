package com.example.cmmsApplication.site.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteDTO {
    private Long id;
    @NotBlank(message = "Site code is required")
    private String siteCode;
    @NotBlank(message = "Site name is required")
    private String siteName;
    private String organizationName;
    private String siteType;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String contactPerson;
    private String contactMobile;
    @Email(message = "Contact email should be valid")
    private String contactEmail;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
