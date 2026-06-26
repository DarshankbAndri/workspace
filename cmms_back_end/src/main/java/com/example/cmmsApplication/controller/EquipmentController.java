package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.EquipmentDTO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/equipment")
public class EquipmentController {
    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @PostMapping
    public ResponseEntity<EquipmentDTO> create(@Valid @RequestBody EquipmentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipmentService.create(dto));
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(equipmentService.searchEquipment(searchDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDTO> update(@PathVariable Long id, @Valid @RequestBody EquipmentDTO dto) {
        return ResponseEntity.ok(equipmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getAll(@RequestParam(required = false) Long siteId) {
        return ResponseEntity.ok(equipmentService.getAll(siteId));
    }
}
