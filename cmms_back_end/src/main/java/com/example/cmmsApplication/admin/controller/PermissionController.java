package com.example.cmmsApplication.admin.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.admin.dto.PermissionDTO;
import com.example.cmmsApplication.admin.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/permissions")
public class PermissionController {
    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseFactory.ok(permissionService.getAll());
    }

    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<?>> getGrouped() {
        return ResponseFactory.ok(permissionService.getGrouped());
    }
}




