package com.example.cmmsApplication.vendor.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.vendor.entity.Vendor;
import jakarta.validation.constraints.Email;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorDTO {
    private Long id;
    @NotBlank(message = "Vendor code is required")
    private String vendorCode;
    @NotBlank(message = "Vendor name is required")
    private String vendorName;
    private String contactPerson;
    @Email(message = "Email should be valid")
    private String email;
    private String phone;
    private String address;
    private String serviceCategory;
    private Boolean active;
    private Integer assignedSiteCount;
    private String primarySiteName;
    private String siteNames;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Valid
    private List<VendorSiteAssignmentDTO> siteAssignments = new ArrayList<>();

}
