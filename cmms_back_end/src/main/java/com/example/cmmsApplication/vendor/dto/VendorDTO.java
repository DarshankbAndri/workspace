package com.example.cmmsApplication.vendor.dto;


import com.example.cmmsApplication.vendor.entity.Vendor;
import jakarta.validation.constraints.Email;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVendorCode() { return vendorCode; }
    public void setVendorCode(String vendorCode) { this.vendorCode = vendorCode; }
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Integer getAssignedSiteCount() { return assignedSiteCount; }
    public void setAssignedSiteCount(Integer assignedSiteCount) { this.assignedSiteCount = assignedSiteCount; }
    public String getPrimarySiteName() { return primarySiteName; }
    public void setPrimarySiteName(String primarySiteName) { this.primarySiteName = primarySiteName; }
    public String getSiteNames() { return siteNames; }
    public void setSiteNames(String siteNames) { this.siteNames = siteNames; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<VendorSiteAssignmentDTO> getSiteAssignments() { return siteAssignments; }
    public void setSiteAssignments(List<VendorSiteAssignmentDTO> siteAssignments) { this.siteAssignments = siteAssignments; }
}





