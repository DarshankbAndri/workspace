package com.example.cmmsApplication.spareparts.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.spareparts.dto.SparePartReorderDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.spareparts.service.SparePartReorderService;
import jakarta.validation.Valid;
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
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId,
                                                            @RequestParam(required = false) String status) {
        return ResponseFactory.ok(reorderService.getAll(siteId, status));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody SparePartReorderDTO dto) {
        return ResponseFactory.created(reorderService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody SparePartReorderDTO dto) {
        return ResponseFactory.ok(reorderService.update(id, dto));
    }

    @PostMapping("/{id}/receive-stock")
    public ResponseEntity<ApiResponse<?>> receiveStock(@PathVariable Long id,
                                                            @RequestBody(required = false) SparePartTransactionDTO dto) {
        return ResponseFactory.ok(reorderService.receiveStock(id, dto));
    }
}




