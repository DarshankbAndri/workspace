package com.example.cmmsApplication.admin.service;

import com.example.cmmsApplication.admin.dto.UserRoleAssignmentDTO;
import java.util.List;

/** Service contract for user role assignment. */
public interface UserRoleAssignmentService {
    List<UserRoleAssignmentDTO> getByUserId(Long userId);

    List<UserRoleAssignmentDTO> replaceUserRoles(Long userId, List<UserRoleAssignmentDTO> assignments);
}
