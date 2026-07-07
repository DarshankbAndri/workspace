package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.common.config.FileStorageConfig;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.dto.EquipmentDocumentDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.entity.EquipmentDocument;
import com.example.cmmsApplication.equipment.repository.EquipmentDocumentRepository;
import com.example.cmmsApplication.user.entity.User;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentDocumentService {
    private static final long MAX_FILE_SIZE_BYTES = 25L * 1024L * 1024L;
    private static final Set<String> DOCUMENT_TYPES = Set.of(
            "MANUAL",
            "DRAWING",
            "CERTIFICATE",
            "INSPECTION_REPORT",
            "SOP",
            "WARRANTY",
            "SAFETY",
            "OTHER"
    );
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private final EquipmentService equipmentService;
    private final EquipmentDocumentRepository documentRepository;
    private final AccessControlService accessControlService;
    private final FileStorageConfig fileStorageConfig;

    @Transactional(readOnly = true)
    public List<EquipmentDocumentDTO> getDocuments(Long equipmentId) {
        Equipment equipment = getAccessibleEquipment(equipmentId);
        return documentRepository.findByEquipment_IdOrderByUploadedAtDescDocumentIdDesc(equipment.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EquipmentDocumentDTO uploadDocument(Long equipmentId, String documentType, LocalDate expiryDate, String remarks, MultipartFile file) {
        Equipment equipment = getAccessibleEquipment(equipmentId);
        validateFile(file);

        String normalizedType = normalizeDocumentType(documentType);
        Path target = storeDocumentFile(equipmentId, file);

        EquipmentDocument document = new EquipmentDocument();
        document.setEquipment(equipment);
        document.setDocumentType(normalizedType);
        document.setFileName(file.getOriginalFilename() == null ? "equipment-document" : file.getOriginalFilename());
        document.setStoredFileName(target.getFileName().toString());
        document.setStoredFilePath(target.toString());
        document.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        document.setFileSize(file.getSize());
        document.setExpiryDate(expiryDate);
        document.setRemarks(blankToNull(remarks));
        document.setUploadedBy(accessControlService.getCurrentUser());

        EquipmentDocument saved = documentRepository.save(document);
        saved.setFileUrl("/api/equipment/" + equipmentId + "/documents/" + saved.getDocumentId() + "/file");
        return toDTO(documentRepository.save(saved));
    }

    @Transactional(readOnly = true)
    public EquipmentDocument getDocument(Long equipmentId, Long documentId) {
        getAccessibleEquipment(equipmentId);
        return documentRepository.findByDocumentIdAndEquipment_Id(documentId, equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment document not found with id: " + documentId));
    }

    @Transactional(readOnly = true)
    public Resource getDocumentResource(EquipmentDocument document) {
        try {
            Path documentPath = Path.of(document.getStoredFilePath()).toAbsolutePath().normalize();
            if (!documentPath.startsWith(documentDirectory())) {
                throw new ResourceNotFoundException("Equipment document file not found");
            }
            Resource resource = new UrlResource(documentPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Equipment document file not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Equipment document file not found", ex);
        }
    }

    public void deleteDocument(Long equipmentId, Long documentId) {
        EquipmentDocument document = getDocument(equipmentId, documentId);
        deleteStoredDocumentQuietly(document);
        documentRepository.delete(document);
    }

    private Equipment getAccessibleEquipment(Long equipmentId) {
        Equipment equipment = equipmentService.getEntity(equipmentId);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        return equipment;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Document file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidOperationException("Document file exceeds maximum size of 25 MB");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidOperationException("Document file type is not allowed");
        }
    }

    private Path storeDocumentFile(Long equipmentId, MultipartFile file) {
        try {
            Files.createDirectories(documentDirectory());
            String storedName = "equipment-" + equipmentId + "-" + UUID.randomUUID() + extension(file.getOriginalFilename());
            Path target = documentDirectory().resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException ex) {
            throw new InvalidOperationException("Unable to store equipment document file", ex);
        }
    }

    private Path documentDirectory() {
        return Path.of(fileStorageConfig.getPath()).resolve("equipment-document").toAbsolutePath().normalize();
    }

    private String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".bin";
        }
        String ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return ext.matches("\\.(pdf|png|jpg|jpeg|webp|txt|doc|docx|xls|xlsx)") ? ext : ".bin";
    }

    private String normalizeDocumentType(String value) {
        String normalized = value == null || value.isBlank() ? "OTHER" : value.trim().toUpperCase(Locale.ROOT);
        if (!DOCUMENT_TYPES.contains(normalized)) {
            throw new InvalidOperationException("Document type must be one of: " + String.join(", ", DOCUMENT_TYPES));
        }
        return normalized;
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private void deleteStoredDocumentQuietly(EquipmentDocument document) {
        try {
            Files.deleteIfExists(Path.of(document.getStoredFilePath()).toAbsolutePath().normalize());
        } catch (IOException ignored) {
            // Keep metadata deletion independent from filesystem cleanup failures.
        }
    }

    private EquipmentDocumentDTO toDTO(EquipmentDocument document) {
        return EquipmentDocumentDTO.builder()
                .documentId(document.getDocumentId())
                .equipmentId(document.getEquipment() == null ? null : document.getEquipment().getId())
                .documentType(document.getDocumentType())
                .fileName(document.getFileName())
                .fileUrl(document.getFileUrl())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .expiryDate(document.getExpiryDate())
                .uploadedById(document.getUploadedBy() == null ? null : document.getUploadedBy().getId())
                .uploadedByName(userName(document.getUploadedBy()))
                .uploadedAt(document.getUploadedAt())
                .remarks(document.getRemarks())
                .build();
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
