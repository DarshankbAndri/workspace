package com.example.cmmsApplication.assignment.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentDTO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentChecklistItemDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistProof;
import com.example.cmmsApplication.assignment.service.MaintenanceAssignmentChecklistService;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.assignment.service.MaintenanceAssignmentService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/maintenance/assignments")
public class MaintenanceAssignmentController {
    private final MaintenanceAssignmentService assignmentService;
    private final MaintenanceAssignmentChecklistService checklistService;
    private final ListSearchService listSearchService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody MaintenanceAssignmentDTO dto) {
        return ResponseFactory.created(assignmentService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody MaintenanceAssignmentDTO dto) {
        return ResponseFactory.ok(assignmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(assignmentService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(assignmentService.getAll(siteId));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchMaintenanceAssignments(searchDTO));
    }

    @GetMapping("/{assignmentId}/checklist")
    public ResponseEntity<ApiResponse<?>> getChecklist(@PathVariable Long assignmentId) {
        return ResponseFactory.ok(checklistService.getChecklist(assignmentId));
    }

    @PostMapping("/{assignmentId}/checklist")
    public ResponseEntity<ApiResponse<?>> addChecklistItem(@PathVariable Long assignmentId,
                                                           @Valid @RequestBody MaintenanceAssignmentChecklistItemDTO dto) {
        return ResponseFactory.created(checklistService.addItem(assignmentId, dto));
    }

    @PutMapping("/{assignmentId}/checklist/{itemId}")
    public ResponseEntity<ApiResponse<?>> updateChecklistItem(@PathVariable Long assignmentId,
                                                              @PathVariable Long itemId,
                                                              @Valid @RequestBody MaintenanceAssignmentChecklistItemDTO dto) {
        return ResponseFactory.ok(checklistService.updateItem(assignmentId, itemId, dto));
    }

    @DeleteMapping("/{assignmentId}/checklist/{itemId}")
    public ResponseEntity<ApiResponse<?>> deleteChecklistItem(@PathVariable Long assignmentId, @PathVariable Long itemId) {
        checklistService.deleteItem(assignmentId, itemId);
        return ResponseFactory.ok(null);
    }

    @PostMapping(value = "/{assignmentId}/checklist/{itemId}/proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadChecklistProof(@PathVariable Long assignmentId,
                                                               @PathVariable Long itemId,
                                                               @RequestParam("file") MultipartFile file) {
        return ResponseFactory.created(checklistService.uploadProof(assignmentId, itemId, file));
    }

    @GetMapping("/{assignmentId}/checklist/{itemId}/proof/{proofId}")
    public ResponseEntity<Resource> downloadChecklistProof(@PathVariable Long assignmentId,
                                                           @PathVariable Long itemId,
                                                           @PathVariable Long proofId) {
        MaintenanceAssignmentChecklistProof proof = checklistService.getProof(assignmentId, itemId, proofId);
        Resource resource = checklistService.getProofResource(proof);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(proof.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFileName(proof.getOriginalFileName()) + "\"")
                .body(resource);
    }

    @DeleteMapping("/{assignmentId}/checklist/{itemId}/proof/{proofId}")
    public ResponseEntity<ApiResponse<?>> deleteChecklistProof(@PathVariable Long assignmentId,
                                                               @PathVariable Long itemId,
                                                               @PathVariable Long proofId) {
        checklistService.deleteProof(assignmentId, itemId, proofId);
        return ResponseFactory.ok(null);
    }

    private String safeFileName(String fileName) {
        return fileName == null ? "proof" : fileName.replace("\"", "");
    }
}
