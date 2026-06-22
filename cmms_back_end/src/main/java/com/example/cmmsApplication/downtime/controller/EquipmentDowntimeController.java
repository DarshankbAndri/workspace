package com.example.cmmsApplication.downtime.controller;

import com.example.cmmsApplication.downtime.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.downtime.service.EquipmentDowntimeService;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<List<EquipmentDowntimeDTO>> getAll(@RequestParam(required = false) Long siteId,
                                                             @RequestParam(required = false) Long equipmentId) {
        return ResponseEntity.ok(downtimeService.getAll(siteId, equipmentId));
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchDowntime(searchDTO));
    }
}




