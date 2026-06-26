package com.example.cmmsApplication.site.controller;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.site.dto.SiteDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.site.service.SiteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/sites")
@RequiredArgsConstructor
public class SiteController {
    private final SiteService siteService;
    private final ListSearchService listSearchService;

@PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody SiteDTO dto) {
        return ResponseFactory.created(siteService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody SiteDTO dto) {
        return ResponseFactory.ok(siteService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        siteService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(siteService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseFactory.ok(siteService.getAll());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchSites(searchDTO));
    }
}
