package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.MaintenanceAssignmentDTO;
import com.example.cmmsApplication.service.MaintenanceAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/maintenance/assignments")
public class MaintenanceAssignmentController {
    private final MaintenanceAssignmentService assignmentService;

    public MaintenanceAssignmentController(MaintenanceAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceAssignmentDTO> create(@Valid @RequestBody MaintenanceAssignmentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceAssignmentDTO> update(@PathVariable Long id, @Valid @RequestBody MaintenanceAssignmentDTO dto) {
        return ResponseEntity.ok(assignmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceAssignmentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceAssignmentDTO>> getAll(@RequestParam(required = false) Long siteId) {
        return ResponseEntity.ok(assignmentService.getAll(siteId));
    }
}
