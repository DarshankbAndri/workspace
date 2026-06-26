package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.dto.VendorDTO;
import com.example.cmmsApplication.service.ListSearchService;
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
    private final ListSearchService listSearchService;

    public VendorController(VendorService vendorService, ListSearchService listSearchService) {
        this.vendorService = vendorService;
        this.listSearchService = listSearchService;
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
    public ResponseEntity<List<VendorDTO>> getAll(@RequestParam(required = false) Long siteId,
                                                  @RequestParam(required = false) String status) {
        Boolean active = null;
        if ("ACTIVE".equalsIgnoreCase(status)) {
            active = true;
        } else if ("INACTIVE".equalsIgnoreCase(status)) {
            active = false;
        }
        return ResponseEntity.ok(vendorService.getAll(siteId, active));
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchVendors(searchDTO));
    }
}
