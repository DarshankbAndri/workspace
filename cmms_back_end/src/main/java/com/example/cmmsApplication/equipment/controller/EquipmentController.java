package com.example.cmmsApplication.equipment.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.equipment.dto.EquipmentDTO;
import com.example.cmmsApplication.equipment.dto.EquipmentSpareBomDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.equipment.entity.EquipmentDocument;
import com.example.cmmsApplication.equipment.service.EquipmentDocumentService;
import com.example.cmmsApplication.equipment.service.EquipmentService;
import com.example.cmmsApplication.equipment.service.EquipmentSpareBomService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/equipment")
public class EquipmentController {
    private final EquipmentService equipmentService;
    private final EquipmentDocumentService equipmentDocumentService;
    private final EquipmentSpareBomService equipmentSpareBomService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody EquipmentDTO dto) {
        return ResponseFactory.created(equipmentService.create(dto));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(equipmentService.searchEquipment(searchDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody EquipmentDTO dto) {
        return ResponseFactory.ok(equipmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<?>> getSummary(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentService.getSummary(id));
    }

    @GetMapping("/{id}/health")
    public ResponseEntity<ApiResponse<?>> getHealth(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentService.getHealth(id));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<?>> getDocuments(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentDocumentService.getDocuments(id));
    }

    @GetMapping("/{id}/spare-bom")
    public ResponseEntity<ApiResponse<?>> getSpareBom(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentSpareBomService.getByEquipment(id));
    }

    @PostMapping("/{id}/spare-bom")
    public ResponseEntity<ApiResponse<?>> createSpareBom(@PathVariable Long id, @RequestBody EquipmentSpareBomDTO dto) {
        return ResponseFactory.created(equipmentSpareBomService.create(id, dto));
    }

    @PutMapping("/{id}/spare-bom/{bomId}")
    public ResponseEntity<ApiResponse<?>> updateSpareBom(@PathVariable Long id,
                                                         @PathVariable Long bomId,
                                                         @RequestBody EquipmentSpareBomDTO dto) {
        return ResponseFactory.ok(equipmentSpareBomService.update(id, bomId, dto));
    }

    @DeleteMapping("/{id}/spare-bom/{bomId}")
    public ResponseEntity<ApiResponse<?>> deleteSpareBom(@PathVariable Long id, @PathVariable Long bomId) {
        equipmentSpareBomService.delete(id, bomId);
        return ResponseFactory.ok(null);
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadDocument(@PathVariable Long id,
                                                         @RequestParam("documentType") String documentType,
                                                         @RequestParam(value = "expiryDate", required = false)
                                                         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
                                                         @RequestParam(value = "remarks", required = false) String remarks,
                                                         @RequestParam("file") MultipartFile file) {
        return ResponseFactory.created(equipmentDocumentService.uploadDocument(id, documentType, expiryDate, remarks, file));
    }

    @GetMapping("/{id}/documents/{documentId}/file")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, @PathVariable Long documentId) {
        EquipmentDocument document = equipmentDocumentService.getDocument(id, documentId);
        Resource resource = equipmentDocumentService.getDocumentResource(document);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFileName(document.getFileName()) + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    public ResponseEntity<ApiResponse<?>> deleteDocument(@PathVariable Long id, @PathVariable Long documentId) {
        equipmentDocumentService.deleteDocument(id, documentId);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(equipmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(equipmentService.getAll(siteId));
    }

    private String safeFileName(String fileName) {
        return fileName == null ? "equipment-document" : fileName.replace("\"", "");
    }
}
