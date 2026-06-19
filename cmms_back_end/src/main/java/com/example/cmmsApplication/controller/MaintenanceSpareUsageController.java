package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.service.MaintenanceSpareUsageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maintenance/assignments/{assignmentId}/spares")
public class MaintenanceSpareUsageController {
    private final MaintenanceSpareUsageService spareUsageService;

    public MaintenanceSpareUsageController(MaintenanceSpareUsageService spareUsageService) {
        this.spareUsageService = spareUsageService;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceSpareUsageDTO>> getByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(spareUsageService.getByAssignment(assignmentId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceSpareUsageDTO> create(@PathVariable Long assignmentId,
                                                           @Valid @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(spareUsageService.create(assignmentId, dto));
    }

    @PutMapping("/{usageId}")
    public ResponseEntity<MaintenanceSpareUsageDTO> update(@PathVariable Long assignmentId,
                                                           @PathVariable Long usageId,
                                                           @Valid @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.update(assignmentId, usageId, dto));
    }

    @DeleteMapping("/{usageId}")
    public ResponseEntity<Void> delete(@PathVariable Long assignmentId, @PathVariable Long usageId) {
        spareUsageService.delete(assignmentId, usageId);
        return ResponseEntity.noContent().build();
    }
}
