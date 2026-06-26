package com.example.cmmsApplication.company.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.company.entity.Company;
import com.example.cmmsApplication.company.dto.CompanyDTO;
import com.example.cmmsApplication.company.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/company")
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody CompanyDTO dto) {
        return ResponseFactory.created(companyService.create(dto));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody CompanyDTO dto) {
        return ResponseFactory.ok(companyService.update(id, dto));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<?>> current() {
        CompanyDTO company = companyService.getCurrent();
        return ResponseFactory.ok(company);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(companyService.getById(id));
    }

    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadLogo(@RequestParam Long companyId, @RequestParam("file") MultipartFile file) {
        return ResponseFactory.ok(companyService.uploadLogo(companyId, file));
    }

    @GetMapping("/logo/{fileName:.+}")
    public ResponseEntity<Resource> logo(@PathVariable String fileName) {
        Resource resource = companyService.getLogo(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
