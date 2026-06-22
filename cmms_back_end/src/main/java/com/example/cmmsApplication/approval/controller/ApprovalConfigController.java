package com.example.cmmsApplication.approval.controller;

import com.example.cmmsApplication.approval.dto.ApprovalConfigDTO;
import com.example.cmmsApplication.approval.service.ApprovalConfigService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/approval-config")
public class ApprovalConfigController {
    private final ApprovalConfigService approvalConfigService;

    public ApprovalConfigController(ApprovalConfigService approvalConfigService) {
        this.approvalConfigService = approvalConfigService;
    }

    @GetMapping
    public ResponseEntity<List<ApprovalConfigDTO>> getAll() {
        return ResponseEntity.ok(approvalConfigService.getAll());
    }

    @PostMapping
    public ResponseEntity<ApprovalConfigDTO> create(@RequestBody ApprovalConfigDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(approvalConfigService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApprovalConfigDTO> update(@PathVariable Long id, @RequestBody ApprovalConfigDTO dto) {
        return ResponseEntity.ok(approvalConfigService.update(id, dto));
    }
}




