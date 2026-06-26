package com.example.cmmsApplication.spareparts.controller;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.spareparts.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartReorderDTO;
import com.example.cmmsApplication.spareparts.service.MaintenanceSpareUsageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SpareRequestController {
    private final MaintenanceSpareUsageService spareUsageService;

@PostMapping("/assignments/{assignmentId}/spare-requests")
    public ResponseEntity<ApiResponse<?>> create(@PathVariable Long assignmentId,
                                                           @Valid @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.created(spareUsageService.create(assignmentId, dto));
    }

    @GetMapping("/spare-requests")
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) String status) {
        return ResponseFactory.ok(spareUsageService.getAll(status));
    }

    @GetMapping("/spare-requests/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(spareUsageService.getById(id));
    }

    @PostMapping("/spare-requests/{id}/manager-approve")
    public ResponseEntity<ApiResponse<?>> managerApprove(@PathVariable Long id,
                                                                   @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.managerApprove(id, dto));
    }

    @PostMapping("/spare-requests/{id}/manager-reject")
    public ResponseEntity<ApiResponse<?>> managerReject(@PathVariable Long id,
                                                                  @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.managerReject(id, dto));
    }

    @PostMapping("/spare-requests/{id}/check-stock")
    public ResponseEntity<ApiResponse<?>> checkStock(@PathVariable Long id,
                                                               @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.checkStock(id, dto));
    }

    @PostMapping("/spare-requests/{id}/reserve")
    public ResponseEntity<ApiResponse<?>> reserve(@PathVariable Long id,
                                                            @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.reserveById(id, dto));
    }

    @PostMapping("/spare-requests/{id}/issue")
    public ResponseEntity<ApiResponse<?>> issue(@PathVariable Long id,
                                                          @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.issueById(id, dto));
    }

    @PostMapping("/spare-requests/{id}/create-purchase-request")
    public ResponseEntity<ApiResponse<?>> createPurchaseRequest(@PathVariable Long id,
                                                                     @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.created(spareUsageService.createPurchaseRequest(id, dto));
    }

    @PostMapping("/spare-requests/{id}/consume-return")
    public ResponseEntity<ApiResponse<?>> consumeReturn(@PathVariable Long id,
                                                                  @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseFactory.ok(spareUsageService.consumeReturnById(id, dto));
    }
}
