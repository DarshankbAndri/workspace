package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/maintenance/requests")
public class MaintenanceRequestController {
    private final MaintenanceRequestService requestService;

    public MaintenanceRequestController(MaintenanceRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequestDTO> create(@Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDTO> update(@PathVariable Long id, @Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(requestService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        requestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRequestDTO>> getAll() {
        return ResponseEntity.ok(requestService.getAll());
    }
}
