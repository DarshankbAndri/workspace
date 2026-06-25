package com.example.cmmsApplication.admin.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.admin.dto.UserRoleAssignmentDTO;
import com.example.cmmsApplication.admin.service.UserRoleAssignmentService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ApiResponse<?>> getByUserId(@PathVariable Long userId) {
        return ResponseFactory.ok(userRoleAssignmentService.getByUserId(userId));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<?>> replace(@PathVariable Long userId, @RequestBody List<UserRoleAssignmentDTO> assignments) {
        return ResponseFactory.ok(userRoleAssignmentService.replaceUserRoles(userId, assignments));
    }
}




