package com.example.travelreimbursement.controller;

import com.example.travelreimbursement.dto.DocumentResponse;
import com.example.travelreimbursement.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    /**
     * Download a document file
     * GET /api/documents/download/{documentId}
     *
     * @param documentId the ID of the document to download
     * @param entryType the type of entry (daily, hotel, telephone, taxi, miscellaneous, other)
     * @return the file content as attachment
     */
    @GetMapping("/download/{documentId}")
    @Operation(summary = "Download a document file",
               description = "Downloads a document file as an attachment with the appropriate content type and filename")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", 
                    description = "Document downloaded successfully",
                    content = {
                        @Content(mediaType = "application/pdf"),
                        @Content(mediaType = "image/png"),
                        @Content(mediaType = "image/jpeg"),
                        @Content(mediaType = "image/gif"),
                        @Content(mediaType = "image/webp"),
                        @Content(mediaType = "application/octet-stream")
                    }),
        @ApiResponse(responseCode = "400", description = "Invalid entry type or document not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
        @ApiResponse(responseCode = "500", description = "Server error downloading file")
    })
    public ResponseEntity<?> downloadDocument(
            @Parameter(description = "The ID of the document to download") @PathVariable Long documentId,
            @Parameter(description = "The type of entry (daily, hotel, telephone, taxi, miscellaneous, other)") @RequestParam String entryType) {
        try {
            DocumentService.FileDownloadResponse fileResponse = documentService.downloadDocument(documentId, entryType);
            
            // Determine content type based on file extension
            MediaType contentType = determineContentType(fileResponse.getFileName());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(contentType);
            headers.setContentLength(fileResponse.getContent().length);
            
            // Encode filename for HTTP header
            String encodedFilename = URLEncoder.encode(fileResponse.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");
            headers.setContentDispositionFormData("attachment", fileResponse.getFileName());
            headers.set("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFilename);
            
            return new ResponseEntity<>(fileResponse.getContent(), headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error downloading file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * View a document file inline (for PDFs and images)
     * GET /api/documents/view/{documentId}
     *
     * @param documentId the ID of the document to view
     * @param entryType the type of entry (daily, hotel, telephone, taxi, miscellaneous, other)
     * @return the file content for inline viewing
     */
    @GetMapping("/view/{documentId}")
    @Operation(summary = "View a document file inline",
               description = "Retrieves a document file for inline viewing (PDFs, images, etc.) in the browser")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", 
                    description = "Document retrieved successfully for viewing",
                    content = {
                        @Content(mediaType = "application/pdf"),
                        @Content(mediaType = "image/png"),
                        @Content(mediaType = "image/jpeg"),
                        @Content(mediaType = "image/gif"),
                        @Content(mediaType = "image/webp"),
                        @Content(mediaType = "application/octet-stream")
                    }),
        @ApiResponse(responseCode = "400", description = "Invalid entry type or document not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
        @ApiResponse(responseCode = "500", description = "Server error retrieving file")
    })
    public ResponseEntity<?> viewDocument(
            @Parameter(description = "The ID of the document to view") @PathVariable Long documentId,
            @Parameter(description = "The type of entry (daily, hotel, telephone, taxi, miscellaneous, other)") @RequestParam String entryType) {
        try {
            DocumentService.FileDownloadResponse fileResponse = documentService.downloadDocument(documentId, entryType);
            
            // Determine content type based on file extension
            MediaType contentType = determineContentType(fileResponse.getFileName());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(contentType);
            headers.setContentLength(fileResponse.getContent().length);
            headers.set("Content-Disposition", "inline; filename=\"" + fileResponse.getFileName() + "\"");
            
            return new ResponseEntity<>(fileResponse.getContent(), headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Determine content type based on file extension
     */
    private MediaType determineContentType(String fileName) {
        if (fileName.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        } else if (fileName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (fileName.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        } else if (fileName.endsWith(".webp")) {
            return MediaType.valueOf("image/webp");
        } else {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
