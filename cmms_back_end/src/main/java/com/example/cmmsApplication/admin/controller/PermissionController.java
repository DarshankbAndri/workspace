package com.example.cmmsApplication.admin.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.admin.dto.PermissionDTO;
import com.example.cmmsApplication.admin.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/permissions")
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseFactory.ok(permissionService.getAll());
    }

    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<?>> getGrouped() {
        return ResponseFactory.ok(permissionService.getGrouped());
    }
}
