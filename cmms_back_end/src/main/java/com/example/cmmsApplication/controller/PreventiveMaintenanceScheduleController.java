package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.PreventiveMaintenanceScheduleDTO;
import com.example.cmmsApplication.service.PreventiveMaintenanceScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/preventive-maintenance/schedules")
public class PreventiveMaintenanceScheduleController {
    private final PreventiveMaintenanceScheduleService scheduleService;

    public PreventiveMaintenanceScheduleController(PreventiveMaintenanceScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<PreventiveMaintenanceScheduleDTO> create(@Valid @RequestBody PreventiveMaintenanceScheduleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PreventiveMaintenanceScheduleDTO> update(@PathVariable Long id, @Valid @RequestBody PreventiveMaintenanceScheduleDTO dto) {
        return ResponseEntity.ok(scheduleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PreventiveMaintenanceScheduleDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<PreventiveMaintenanceScheduleDTO>> getAll() {
        return ResponseEntity.ok(scheduleService.getAll());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<PreventiveMaintenanceScheduleDTO>> getUpcoming(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(scheduleService.getUpcoming(days));
    }

    @PostMapping("/{id}/generate-work-order")
    public ResponseEntity<PreventiveMaintenanceScheduleDTO> generateWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.generateWorkOrder(id));
    }

    @PostMapping("/generate-due-work-orders")
    public ResponseEntity<List<PreventiveMaintenanceScheduleDTO>> generateDueWorkOrders() {
        return ResponseEntity.ok(scheduleService.generateDueWorkOrders());
    }
}
