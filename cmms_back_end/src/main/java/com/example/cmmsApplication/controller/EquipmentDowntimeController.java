package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.service.EquipmentDowntimeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/maintenance/downtime")
public class EquipmentDowntimeController {
    private final EquipmentDowntimeService downtimeService;

    public EquipmentDowntimeController(EquipmentDowntimeService downtimeService) {
        this.downtimeService = downtimeService;
    }

    @PostMapping
    public ResponseEntity<EquipmentDowntimeDTO> create(@Valid @RequestBody EquipmentDowntimeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(downtimeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDowntimeDTO> update(@PathVariable Long id, @Valid @RequestBody EquipmentDowntimeDTO dto) {
        return ResponseEntity.ok(downtimeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        downtimeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDowntimeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(downtimeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<EquipmentDowntimeDTO>> getAll(@RequestParam(required = false) Long equipmentId) {
        if (equipmentId != null) {
            return ResponseEntity.ok(downtimeService.getByEquipmentId(equipmentId));
        }
        return ResponseEntity.ok(downtimeService.getAll());
    }
}
