package com.example.travelreimbursement.controller;

import com.example.travelreimbursement.dto.DocumentResponse;
import com.example.travelreimbursement.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload a document for a specific expense entry
     * POST /api/documents/upload/{entryType}/{entryId}
     *
     * @param entryType the type of entry (daily, hotel, telephone, taxi, miscellaneous, other)
     * @param entryId the ID of the entry
     * @param documentName the user-provided document name
     * @param file the file to upload
     * @param sectionId the section ID for grouping documents
     * @return the created document response
     */
    @PostMapping("/upload/{entryType}/{entryId}")
    public ResponseEntity<?> uploadDocument(@PathVariable String entryType,
                                           @PathVariable Long entryId,
                                           @RequestParam String documentName,
                                           @RequestParam MultipartFile file,
                                           @RequestParam String sectionId) {
        try {
            DocumentResponse response = documentService.uploadDocument(
                entryType, entryId, documentName, file, sectionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error uploading file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Get all documents for a section
     * GET /api/documents/section/{sectionId}
     *
     * @param sectionId the section ID
     * @return list of documents in that section
     */
    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsBySection(@PathVariable String sectionId) {
        List<DocumentResponse> documents = documentService.getDocumentsBySection(sectionId);
        return ResponseEntity.ok(documents);
    }

    /**
     * Delete a document
     * DELETE /api/documents/{entryType}/{documentId}
     *
     * @param entryType the type of entry (daily, hotel, telephone, taxi, miscellaneous, other)
     * @param documentId the ID of the document to delete
     * @return success message
     */
    @DeleteMapping("/{entryType}/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable String entryType,
                                           @PathVariable Long documentId) {
        try {
            documentService.deleteDocument(entryType, documentId);
            return ResponseEntity.ok("Document deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Error: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected error: " + e.getMessage());
        }
    }
}
