package com.example.travelreimbursement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Document information DTO")
public class DocumentDTO {

    @Schema(description = "Document ID", example = "1")
    private Long id;

    @Schema(description = "Document name", example = "Hotel Receipt")
    private String documentName;

    @Schema(description = "File name", example = "receipt_20240115.pdf")
    private String fileName;

    @Schema(description = "File path or URL", example = "/uploads/documents/receipt_20240115.pdf")
    private String filePath;

    @Schema(description = "Upload timestamp")
    private LocalDateTime uploadedAt;

    public DocumentDTO() {
    }

    public DocumentDTO(Long id, String documentName, String fileName, String filePath, LocalDateTime uploadedAt) {
        this.id = id;
        this.documentName = documentName;
        this.fileName = fileName;
        this.filePath = filePath;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
