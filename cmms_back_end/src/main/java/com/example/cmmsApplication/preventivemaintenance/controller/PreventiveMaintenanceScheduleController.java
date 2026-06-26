package com.example.cmmsApplication.preventivemaintenance.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.preventivemaintenance.dto.PreventiveMaintenanceScheduleDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.preventivemaintenance.service.PreventiveMaintenanceScheduleService;
import jakarta.validation.Valid;
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
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody PreventiveMaintenanceScheduleDTO dto) {
        return ResponseFactory.created(scheduleService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody PreventiveMaintenanceScheduleDTO dto) {
        return ResponseFactory.ok(scheduleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(scheduleService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseFactory.ok(scheduleService.getAll());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchPreventiveSchedules(searchDTO));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<?>> getUpcoming(@RequestParam(defaultValue = "30") int days) {
        return ResponseFactory.ok(scheduleService.getUpcoming(days));
    }

    @PostMapping("/{id}/generate-work-order")
    public ResponseEntity<ApiResponse<?>> generateWorkOrder(@PathVariable Long id) {
        return ResponseFactory.ok(scheduleService.generateWorkOrder(id));
    }

    @PostMapping("/generate-due-work-orders")
    public ResponseEntity<ApiResponse<?>> generateDueWorkOrders() {
        return ResponseFactory.ok(scheduleService.generateDueWorkOrders());
    }
}




