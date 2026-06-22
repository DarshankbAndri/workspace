package com.example.cmmsApplication.site.controller;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.site.dto.SiteDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.site.service.SiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/sites")
public class SiteController {
    private final SiteService siteService;
    private final ListSearchService listSearchService;

    public SiteController(SiteService siteService, ListSearchService listSearchService) {
        this.siteService = siteService;
        this.listSearchService = listSearchService;
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

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchSites(searchDTO));
    }
}





