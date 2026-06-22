package com.example.cmmsApplication.maintenancerequest.controller;


import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.maintenancerequest.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/maintenance/requests")
public class MaintenanceRequestController {
    private final MaintenanceRequestService requestService;
    private final ListSearchService listSearchService;

    public MaintenanceRequestController(MaintenanceRequestService requestService, ListSearchService listSearchService) {
        this.requestService = requestService;
        this.listSearchService = listSearchService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequestDTO> create(@Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDTO> update(@PathVariable Long id, @Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(requestService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        requestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRequestDTO>> getAll(@RequestParam(required = false) Long siteId,
                                                              @RequestParam(required = false) String status) {
        return ResponseEntity.ok(requestService.getAll(siteId, status));
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchMaintenanceRequests(searchDTO));
    }
}





