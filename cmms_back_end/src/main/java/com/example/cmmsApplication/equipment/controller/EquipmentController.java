package com.example.cmmsApplication.equipment.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.dto.EquipmentDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.equipment.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/equipment")
public class EquipmentController {
    private final EquipmentService equipmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody EquipmentDTO dto) {
        return ResponseFactory.created(equipmentService.create(dto));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(equipmentService.searchEquipment(searchDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody EquipmentDTO dto) {
        return ResponseFactory.ok(equipmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<?>> getSummary(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentService.getSummary(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(equipmentService.getAll(siteId));
    }
}
