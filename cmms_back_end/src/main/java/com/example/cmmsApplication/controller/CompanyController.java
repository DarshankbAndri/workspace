package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.CompanyDTO;
import com.example.cmmsApplication.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/company")
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/create")
    public ResponseEntity<CompanyDTO> create(@Valid @RequestBody CompanyDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(dto));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CompanyDTO> update(@PathVariable Long id, @Valid @RequestBody CompanyDTO dto) {
        return ResponseEntity.ok(companyService.update(id, dto));
    }

    @GetMapping("/current")
    public ResponseEntity<CompanyDTO> current() {
        CompanyDTO company = companyService.getCurrent();
        return company == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(company);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyDTO> uploadLogo(@RequestParam Long companyId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(companyService.uploadLogo(companyId, file));
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
