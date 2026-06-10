package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.VendorDTO;
import com.example.cmmsApplication.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/vendors")
public class VendorController {
    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping
    public ResponseEntity<VendorDTO> create(@Valid @RequestBody VendorDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendorService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorDTO> update(@PathVariable Long id, @Valid @RequestBody VendorDTO dto) {
        return ResponseEntity.ok(vendorService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vendorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<VendorDTO>> getAll() {
        return ResponseEntity.ok(vendorService.getAll());
    }
}
