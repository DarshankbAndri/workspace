package com.example.cmmsApplication.user.dto;


import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.company.entity.Company;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.user.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Data Transfer Object for User information")
@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
public class UserDTO {
    
    @Schema(description = "User ID", example = "1")
    private Long id;
    
    @Schema(description = "Username (unique)", example = "john.doe")
    private String username;
    
    @Schema(description = "Email address", example = "john.doe@company.com")
    private String email;
    
    @Schema(description = "First name", example = "John")
    private String firstName;
    
    @Schema(description = "Last name", example = "Doe")
    private String lastName;
    
    @Schema(description = "User role", example = "EMPLOYEE")
    private UserRole role;
    
    @Schema(description = "Department name", example = "IT")
    private String department;
    
    @Schema(description = "Manager ID", example = "2")
    private Long managerId;

    @Schema(description = "Linked employee ID", example = "10")
    private Long employeeId;
    
    @Schema(description = "Account creation timestamp")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Account active status", example = "true")
    private Boolean active;

// All-args constructor
    public UserDTO(Long id, String username, String email, String firstName, String lastName,
                   UserRole role, String department, Long managerId, LocalDateTime createdAt,
                   LocalDateTime updatedAt, Boolean active) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.department = department;
        this.managerId = managerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
    }

}
