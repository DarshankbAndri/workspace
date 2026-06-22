package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.SparePartReorderDTO;
import com.example.cmmsApplication.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.service.SparePartReorderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spare-part-reorders")
public class SparePartReorderController {
    private final SparePartReorderService reorderService;

    public SparePartReorderController(SparePartReorderService reorderService) {
        this.reorderService = reorderService;
    }

    @GetMapping
    public ResponseEntity<List<SparePartReorderDTO>> getAll(@RequestParam(required = false) Long siteId,
                                                            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(reorderService.getAll(siteId, status));
    }

    @PostMapping
    public ResponseEntity<SparePartReorderDTO> create(@Valid @RequestBody SparePartReorderDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reorderService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SparePartReorderDTO> update(@PathVariable Long id, @RequestBody SparePartReorderDTO dto) {
        return ResponseEntity.ok(reorderService.update(id, dto));
    }

    @PostMapping("/{id}/receive-stock")
    public ResponseEntity<SparePartReorderDTO> receiveStock(@PathVariable Long id,
                                                            @RequestBody(required = false) SparePartTransactionDTO dto) {
        return ResponseEntity.ok(reorderService.receiveStock(id, dto));
    }
}
