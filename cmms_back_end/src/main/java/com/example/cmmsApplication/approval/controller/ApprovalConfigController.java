package com.example.cmmsApplication.approval.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.approval.dto.ApprovalConfigDTO;
import com.example.cmmsApplication.approval.service.ApprovalConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/approval-config")
public class ApprovalConfigController {
    private final ApprovalConfigService approvalConfigService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseFactory.ok(approvalConfigService.getAll());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody ApprovalConfigDTO dto) {
        return ResponseFactory.created(approvalConfigService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody ApprovalConfigDTO dto) {
        return ResponseFactory.ok(approvalConfigService.update(id, dto));
    }
}
