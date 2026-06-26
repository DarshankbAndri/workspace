package com.example.cmmsApplication.maintenancerequest.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.maintenancerequest.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/maintenance/requests")
public class MaintenanceRequestController {
    private final MaintenanceRequestService requestService;
    private final ListSearchService listSearchService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseFactory.created(requestService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseFactory.ok(requestService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        requestService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(requestService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId,
                                                              @RequestParam(required = false) String status) {
        return ResponseFactory.ok(requestService.getAll(siteId, status));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchMaintenanceRequests(searchDTO));
    }
}
