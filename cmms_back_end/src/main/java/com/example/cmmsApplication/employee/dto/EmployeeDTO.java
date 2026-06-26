package com.example.cmmsApplication.employee.dto;


import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.user.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EmployeeDTO {
    private Long id;
    @NotBlank(message = "Employee code is required")
    private String employeeCode;
    @NotBlank(message = "First name is required")
    private String firstName;
    private String lastName;
    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;
    @Email(message = "Email should be valid")
    private String email;
    private String gender;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String designation;
    private String department;
    private String status;
    private Integer assignedSiteCount;
    private Boolean loginEnabled;
    private Long userId;
    private String username;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String confirmPassword;
    private UserRole authRole;
    private String accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Valid
    private List<EmployeeSiteAssignmentDTO> siteAssignments = new ArrayList<>();
    @Valid
    private List<EmployeeRoleAssignmentDTO> roleAssignments = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getAssignedSiteCount() { return assignedSiteCount; }
    public void setAssignedSiteCount(Integer assignedSiteCount) { this.assignedSiteCount = assignedSiteCount; }
    public Boolean getLoginEnabled() { return loginEnabled; }
    public void setLoginEnabled(Boolean loginEnabled) { this.loginEnabled = loginEnabled; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public UserRole getAuthRole() { return authRole; }
    public void setAuthRole(UserRole authRole) { this.authRole = authRole; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<EmployeeSiteAssignmentDTO> getSiteAssignments() { return siteAssignments; }
    public void setSiteAssignments(List<EmployeeSiteAssignmentDTO> siteAssignments) { this.siteAssignments = siteAssignments; }
    public List<EmployeeRoleAssignmentDTO> getRoleAssignments() { return roleAssignments; }
    public void setRoleAssignments(List<EmployeeRoleAssignmentDTO> roleAssignments) { this.roleAssignments = roleAssignments; }
}





