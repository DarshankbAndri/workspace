package com.example.cmmsApplication.equipment.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentDocumentDTO {
    private Long documentId;
    private Long equipmentId;
    private String documentType;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private LocalDate expiryDate;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private String remarks;
}
