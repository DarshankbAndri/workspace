package com.example.cmmsApplication.admin.controller;

import com.example.cmmsApplication.admin.dto.UserRoleAssignmentDTO;
import com.example.cmmsApplication.admin.service.UserRoleAssignmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users/{userId}/roles")
public class UserRoleAssignmentController {
    private final UserRoleAssignmentService userRoleAssignmentService;

    public UserRoleAssignmentController(UserRoleAssignmentService userRoleAssignmentService) {
        this.userRoleAssignmentService = userRoleAssignmentService;
    }

    @GetMapping
    public List<UserRoleAssignmentDTO> getByUserId(@PathVariable Long userId) {
        return userRoleAssignmentService.getByUserId(userId);
    }

    @PutMapping
    public List<UserRoleAssignmentDTO> replace(@PathVariable Long userId, @RequestBody List<UserRoleAssignmentDTO> assignments) {
        return userRoleAssignmentService.replaceUserRoles(userId, assignments);
    }
}




