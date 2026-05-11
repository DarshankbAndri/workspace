package com.example.travelreimbursement.dto;

import org.springframework.web.multipart.MultipartFile;

public class DocumentUploadRequest {
    private String documentName;
    private MultipartFile file;
    private String sectionId;

    public DocumentUploadRequest() {
    }

    public DocumentUploadRequest(String documentName, MultipartFile file, String sectionId) {
        this.documentName = documentName;
        this.file = file;
        this.sectionId = sectionId;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }
}
