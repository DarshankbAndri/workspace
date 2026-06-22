package com.example.cmmsApplication.preventivemaintenance.controller;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.preventivemaintenance.dto.PreventiveMaintenanceScheduleDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.preventivemaintenance.service.PreventiveMaintenanceScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/preventive-maintenance/schedules")
public class PreventiveMaintenanceScheduleController {
    private final PreventiveMaintenanceScheduleService scheduleService;
    private final ListSearchService listSearchService;

    public PreventiveMaintenanceScheduleController(PreventiveMaintenanceScheduleService scheduleService, ListSearchService listSearchService) {
        this.scheduleService = scheduleService;
        this.listSearchService = listSearchService;
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

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchPreventiveSchedules(searchDTO));
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




