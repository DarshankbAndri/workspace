package com.example.cmmsApplication.admin.controller;

import com.example.cmmsApplication.admin.dto.PermissionDTO;
import com.example.cmmsApplication.admin.service.PermissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/permissions")
public class PermissionController {
    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<PermissionDTO> getAll() {
        return permissionService.getAll();
    }

    @GetMapping("/grouped")
    public Map<String, List<PermissionDTO>> getGrouped() {
        return permissionService.getGrouped();
    }
}




