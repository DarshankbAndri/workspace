package com.example.cmmsApplication.spareparts.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.spareparts.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.spareparts.service.MaintenanceSpareUsageService;
import jakarta.validation.Valid;
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
    public ResponseEntity<ApiResponse<?>> getByAssignment(@PathVariable Long assignmentId) {
        return ResponseFactory.ok(spareUsageService.getByAssignment(assignmentId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@PathVariable Long assignmentId,
                                                           @Valid @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.created(spareUsageService.create(assignmentId, dto));
    }

    @PutMapping("/{usageId}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long assignmentId,
                                                           @PathVariable Long usageId,
                                                           @Valid @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.update(assignmentId, usageId, dto));
    }

    @PostMapping("/{usageId}/reserve")
    public ResponseEntity<ApiResponse<?>> reserve(@PathVariable Long assignmentId,
                                                            @PathVariable Long usageId,
                                                            @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.reserve(assignmentId, usageId, dto));
    }

    @PostMapping("/{usageId}/issue")
    public ResponseEntity<ApiResponse<?>> issue(@PathVariable Long assignmentId,
                                                          @PathVariable Long usageId,
                                                          @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.issue(assignmentId, usageId, dto));
    }

    @PostMapping("/{usageId}/consume")
    public ResponseEntity<ApiResponse<?>> consume(@PathVariable Long assignmentId,
                                                            @PathVariable Long usageId,
                                                            @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.consume(assignmentId, usageId, dto));
    }

    @PostMapping("/{usageId}/reject")
    public ResponseEntity<ApiResponse<?>> reject(@PathVariable Long assignmentId,
                                                           @PathVariable Long usageId,
                                                           @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.reject(assignmentId, usageId, dto));
    }

    @PostMapping("/{usageId}/cancel")
    public ResponseEntity<ApiResponse<?>> cancel(@PathVariable Long assignmentId,
                                                           @PathVariable Long usageId,
                                                           @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.cancel(assignmentId, usageId, dto));
    }

    @PostMapping("/{usageId}/return")
    public ResponseEntity<ApiResponse<?>> returnIssued(@PathVariable Long assignmentId,
                                                                 @PathVariable Long usageId,
                                                                 @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.returnIssued(assignmentId, usageId, dto));
    }

    @DeleteMapping("/{usageId}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long assignmentId, @PathVariable Long usageId) {
        spareUsageService.delete(assignmentId, usageId);
        return ResponseFactory.ok(null);
    }
}




