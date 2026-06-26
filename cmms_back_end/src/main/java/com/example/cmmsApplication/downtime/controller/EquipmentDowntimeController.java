package com.example.cmmsApplication.downtime.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.downtime.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.downtime.service.EquipmentDowntimeService;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/maintenance/downtime")
public class EquipmentDowntimeController {
    private final EquipmentDowntimeService downtimeService;
    private final ListSearchService listSearchService;

    public EquipmentDowntimeController(EquipmentDowntimeService downtimeService, ListSearchService listSearchService) {
        this.downtimeService = downtimeService;
        this.listSearchService = listSearchService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody EquipmentDowntimeDTO dto) {
        return ResponseFactory.created(downtimeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody EquipmentDowntimeDTO dto) {
        return ResponseFactory.ok(downtimeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        downtimeService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(downtimeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId,
                                                             @RequestParam(required = false) Long equipmentId) {
        return ResponseFactory.ok(downtimeService.getAll(siteId, equipmentId));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchDowntime(searchDTO));
    }
}




