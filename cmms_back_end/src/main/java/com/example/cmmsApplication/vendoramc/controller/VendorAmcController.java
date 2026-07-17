package com.example.cmmsApplication.vendoramc.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.vendoramc.dto.EquipmentAmcMappingDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcContractDTO;
import com.example.cmmsApplication.vendoramc.service.VendorAmcService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vendor-amc")
public class VendorAmcController {
    private final VendorAmcService vendorAmcService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody VendorAmcContractDTO dto) {
        return ResponseFactory.created(vendorAmcService.createAmcContract(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody VendorAmcContractDTO dto) {
        return ResponseFactory.ok(vendorAmcService.updateAmcContract(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(vendorAmcService.getAmcContract(id));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(vendorAmcService.searchAmcContracts(searchDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        vendorAmcService.deleteAmcContract(id);
        return ResponseFactory.ok(null);
    }

    @PostMapping("/{id}/equipment")
    public ResponseEntity<ApiResponse<?>> mapEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentAmcMappingDTO dto) {
        return ResponseFactory.created(vendorAmcService.mapEquipment(id, dto));
    }

    @DeleteMapping("/{id}/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<?>> removeEquipment(@PathVariable Long id, @PathVariable Long equipmentId) {
        vendorAmcService.removeEquipmentMapping(id, equipmentId);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}/equipment")
    public ResponseEntity<ApiResponse<?>> getEquipment(@PathVariable Long id) {
        return ResponseFactory.ok(vendorAmcService.getContractEquipment(id));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<?>> renew(@PathVariable Long id, @Valid @RequestBody VendorAmcContractDTO dto) {
        return ResponseFactory.created(vendorAmcService.renewAmcContract(id, dto));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<?>> dashboard() {
        return ResponseFactory.ok(vendorAmcService.getDashboard());
    }
}
