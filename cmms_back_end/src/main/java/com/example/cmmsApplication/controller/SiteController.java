package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.SiteDTO;
import com.example.cmmsApplication.service.SiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/sites")
public class SiteController {
    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @PostMapping
    public ResponseEntity<SiteDTO> create(@Valid @RequestBody SiteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteDTO> update(@PathVariable Long id, @Valid @RequestBody SiteDTO dto) {
        return ResponseEntity.ok(siteService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<SiteDTO>> getAll() {
        return ResponseEntity.ok(siteService.getAll());
    }
}
