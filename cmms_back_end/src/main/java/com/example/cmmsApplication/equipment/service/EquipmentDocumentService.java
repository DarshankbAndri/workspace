package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.equipment.dto.EquipmentDocumentDTO;
import com.example.cmmsApplication.equipment.entity.EquipmentDocument;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/** Service contract for equipment document. */
public interface EquipmentDocumentService {
    List<EquipmentDocumentDTO> getDocuments(Long equipmentId);

    EquipmentDocumentDTO uploadDocument(Long equipmentId, String documentType, LocalDate expiryDate, String remarks, MultipartFile file);

    EquipmentDocument getDocument(Long equipmentId, Long documentId);

    Resource getDocumentResource(EquipmentDocument document);

    void deleteDocument(Long equipmentId, Long documentId);
}
