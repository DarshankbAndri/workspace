package com.example.travelreimbursement.dto;

import java.time.LocalDateTime;

public class DocumentResponse {
    private Long id;
    private String documentName;
    private String fileName;
    private String sectionId;
    private LocalDateTime uploadedAt;

    public DocumentResponse() {
    }

    public DocumentResponse(Long id, String documentName, String fileName, String sectionId, LocalDateTime uploadedAt) {
        this.id = id;
        this.documentName = documentName;
        this.fileName = fileName;
        this.sectionId = sectionId;
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

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
