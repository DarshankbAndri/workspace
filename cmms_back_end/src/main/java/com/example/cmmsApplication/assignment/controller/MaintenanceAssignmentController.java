package com.example.cmmsApplication.assignment.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.assignment.service.MaintenanceAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/maintenance/assignments")
public class MaintenanceAssignmentController {
    private final MaintenanceAssignmentService assignmentService;
    private final ListSearchService listSearchService;

    public MaintenanceAssignmentController(MaintenanceAssignmentService assignmentService, ListSearchService listSearchService) {
        this.assignmentService = assignmentService;
        this.listSearchService = listSearchService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody MaintenanceAssignmentDTO dto) {
        return ResponseFactory.created(assignmentService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody MaintenanceAssignmentDTO dto) {
        return ResponseFactory.ok(assignmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(assignmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(assignmentService.getAll(siteId));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchMaintenanceAssignments(searchDTO));
    }
}




