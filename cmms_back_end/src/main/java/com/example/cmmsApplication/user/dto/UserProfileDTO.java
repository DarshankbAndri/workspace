package com.example.cmmsApplication.user.dto;

import com.example.cmmsApplication.user.enums.UserRole;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String department;
    private Boolean active;
    private String profilePhotoUrl;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String mobileNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String designation;
    private String employeeDepartment;
    private String employeeStatus;
}
