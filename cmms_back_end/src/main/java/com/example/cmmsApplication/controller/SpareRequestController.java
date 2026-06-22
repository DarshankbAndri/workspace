package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.dto.SparePartReorderDTO;
import com.example.cmmsApplication.service.MaintenanceSpareUsageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SpareRequestController {
    private final MaintenanceSpareUsageService spareUsageService;

    public SpareRequestController(MaintenanceSpareUsageService spareUsageService) {
        this.spareUsageService = spareUsageService;
    }

    @PostMapping("/assignments/{assignmentId}/spare-requests")
    public ResponseEntity<MaintenanceSpareUsageDTO> create(@PathVariable Long assignmentId,
                                                           @Valid @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(spareUsageService.create(assignmentId, dto));
    }

    @GetMapping("/spare-requests")
    public ResponseEntity<List<MaintenanceSpareUsageDTO>> getAll(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(spareUsageService.getAll(status));
    }

    @GetMapping("/spare-requests/{id}")
    public ResponseEntity<MaintenanceSpareUsageDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(spareUsageService.getById(id));
    }

    @PostMapping("/spare-requests/{id}/manager-approve")
    public ResponseEntity<MaintenanceSpareUsageDTO> managerApprove(@PathVariable Long id,
                                                                   @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.managerApprove(id, dto));
    }

    @PostMapping("/spare-requests/{id}/manager-reject")
    public ResponseEntity<MaintenanceSpareUsageDTO> managerReject(@PathVariable Long id,
                                                                  @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.managerReject(id, dto));
    }

    @PostMapping("/spare-requests/{id}/check-stock")
    public ResponseEntity<MaintenanceSpareUsageDTO> checkStock(@PathVariable Long id,
                                                               @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.checkStock(id, dto));
    }

    @PostMapping("/spare-requests/{id}/reserve")
    public ResponseEntity<MaintenanceSpareUsageDTO> reserve(@PathVariable Long id,
                                                            @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.reserveById(id, dto));
    }

    @PostMapping("/spare-requests/{id}/issue")
    public ResponseEntity<MaintenanceSpareUsageDTO> issue(@PathVariable Long id,
                                                          @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.issueById(id, dto));
    }

    @PostMapping("/spare-requests/{id}/create-purchase-request")
    public ResponseEntity<SparePartReorderDTO> createPurchaseRequest(@PathVariable Long id,
                                                                     @RequestBody(required = false) MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(spareUsageService.createPurchaseRequest(id, dto));
    }

    @PostMapping("/spare-requests/{id}/consume-return")
    public ResponseEntity<MaintenanceSpareUsageDTO> consumeReturn(@PathVariable Long id,
                                                                  @RequestBody MaintenanceSpareUsageDTO dto) {
        return ResponseEntity.ok(spareUsageService.consumeReturnById(id, dto));
    }
}
