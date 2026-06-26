package com.example.cmmsApplication.vendor.controller;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.vendor.dto.VendorDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.vendor.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/vendors")
@RequiredArgsConstructor
public class VendorController {
    private final VendorService vendorService;
    private final ListSearchService listSearchService;

@PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody VendorDTO dto) {
        return ResponseFactory.created(vendorService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody VendorDTO dto) {
        return ResponseFactory.ok(vendorService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        vendorService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(vendorService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId,
                                                  @RequestParam(required = false) String status) {
        Boolean active = null;
        if ("ACTIVE".equalsIgnoreCase(status)) {
            active = true;
        } else if ("INACTIVE".equalsIgnoreCase(status)) {
            active = false;
        }
        return ResponseFactory.ok(vendorService.getAll(siteId, active));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchVendors(searchDTO));
    }
}
