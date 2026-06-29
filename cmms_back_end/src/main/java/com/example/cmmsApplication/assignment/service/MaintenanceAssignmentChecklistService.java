package com.example.cmmsApplication.assignment.service;

import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentChecklistDAO;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentChecklistItemDTO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentChecklistProofDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistItem;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistProof;
import com.example.cmmsApplication.common.config.FileStorageConfig;
import com.example.cmmsApplication.common.config.MaintenanceChecklistProperties;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem;
import com.example.cmmsApplication.user.entity.User;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
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
public class MaintenanceAssignmentChecklistService {
    private static final Set<String> RESPONSE_TYPES = Set.of("CHECKBOX", "TEXT", "NUMBER", "PHOTO");
    private static final Set<String> STATUSES = Set.of("PENDING", "COMPLETED", "NOT_APPLICABLE");

    private final MaintenanceAssignmentChecklistDAO checklistDAO;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final AccessControlService accessControlService;
    private final MaintenanceChecklistProperties checklistProperties;
    private final FileStorageConfig fileStorageConfig;

    @Transactional(readOnly = true)
    public List<MaintenanceAssignmentChecklistItemDTO> getChecklist(Long assignmentId) {
        MaintenanceAssignment assignment = getAssignment(assignmentId);
        validateAssignmentSite(assignment);
        return checklistDAO.findByAssignmentId(assignmentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MaintenanceAssignmentChecklistItemDTO addItem(Long assignmentId, MaintenanceAssignmentChecklistItemDTO dto) {
        MaintenanceAssignment assignment = getAssignment(assignmentId);
        validateAssignmentSite(assignment);
        MaintenanceAssignmentChecklistItem item = new MaintenanceAssignmentChecklistItem();
        item.setAssignment(assignment);
        apply(item, dto);
        if (item.getSequenceNumber() == null) {
            item.setSequenceNumber((int) checklistDAO.countItemsByAssignmentId(assignmentId) + 1);
        }
        return toDTO(checklistDAO.saveItem(item));
    }

    public MaintenanceAssignmentChecklistItemDTO updateItem(Long assignmentId, Long itemId, MaintenanceAssignmentChecklistItemDTO dto) {
        MaintenanceAssignmentChecklistItem item = getOwnedItem(assignmentId, itemId);
        apply(item, dto);
        String status = normalizeStatus(dto.getStatus());
        item.setStatus(status);
        if ("COMPLETED".equals(status) || "NOT_APPLICABLE".equals(status)) {
            User user = accessControlService.getCurrentUser();
            item.setCompletedBy(user);
            item.setCompletedAt(LocalDateTime.now());
        } else {
            item.setCompletedBy(null);
            item.setCompletedAt(null);
        }
        return toDTO(checklistDAO.saveItem(item));
    }

    public void deleteItem(Long assignmentId, Long itemId) {
        MaintenanceAssignmentChecklistItem item = getOwnedItem(assignmentId, itemId);
        checklistDAO.findProofsByItemId(item.getId()).forEach(this::deleteStoredProofQuietly);
        checklistDAO.deleteProofsByItemId(item.getId());
        checklistDAO.deleteItem(item);
    }

    public MaintenanceAssignmentChecklistProofDTO uploadProof(Long assignmentId, Long itemId, MultipartFile file) {
        if (!checklistProperties.isProofUploadsEnabled()) {
            throw new InvalidOperationException("Checklist proof uploads are disabled");
        }
        MaintenanceAssignmentChecklistItem item = getOwnedItem(assignmentId, itemId);
        validateProofFile(file);
        Path target = storeProofFile(assignmentId, itemId, file);

        MaintenanceAssignmentChecklistProof proof = new MaintenanceAssignmentChecklistProof();
        proof.setChecklistItem(item);
        proof.setOriginalFileName(file.getOriginalFilename() == null ? "proof" : file.getOriginalFilename());
        proof.setStoredFileName(target.getFileName().toString());
        proof.setStoredFilePath(target.toString());
        proof.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        proof.setFileSize(file.getSize());
        proof.setUploadedBy(accessControlService.getCurrentUser());
        return toProofDTO(checklistDAO.saveProof(proof));
    }

    @Transactional(readOnly = true)
    public MaintenanceAssignmentChecklistProof getProof(Long assignmentId, Long itemId, Long proofId) {
        getOwnedItem(assignmentId, itemId);
        MaintenanceAssignmentChecklistProof proof = checklistDAO.findProofById(proofId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist proof not found with id: " + proofId));
        if (proof.getChecklistItem() == null || !itemId.equals(proof.getChecklistItem().getId())) {
            throw new ResourceNotFoundException("Checklist proof not found with id: " + proofId);
        }
        return proof;
    }

    @Transactional(readOnly = true)
    public Resource getProofResource(MaintenanceAssignmentChecklistProof proof) {
        try {
            Path proofPath = Path.of(proof.getStoredFilePath()).toAbsolutePath().normalize();
            if (!proofPath.startsWith(proofDirectory())) {
                throw new ResourceNotFoundException("Checklist proof not found");
            }
            Resource resource = new UrlResource(proofPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Checklist proof not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Checklist proof not found", ex);
        }
    }

    public void deleteProof(Long assignmentId, Long itemId, Long proofId) {
        MaintenanceAssignmentChecklistProof proof = getProof(assignmentId, itemId, proofId);
        deleteStoredProofQuietly(proof);
        checklistDAO.deleteProof(proof);
    }

    public void copyFromPmTemplate(MaintenanceAssignment assignment, List<PmScheduleChecklistItem> templates) {
        if (!checklistProperties.isEnabled() || assignment == null || templates == null || templates.isEmpty()) {
            return;
        }
        for (PmScheduleChecklistItem template : templates) {
            MaintenanceAssignmentChecklistItem item = new MaintenanceAssignmentChecklistItem();
            item.setAssignment(assignment);
            item.setSourcePmChecklistItem(template);
            item.setSequenceNumber(template.getSequenceNumber());
            item.setTaskTitle(template.getTaskTitle());
            item.setInstructions(template.getInstructions());
            item.setRequired(Boolean.TRUE.equals(template.getRequired()));
            item.setProofRequired(Boolean.TRUE.equals(template.getProofRequired()));
            item.setResponseType(defaultResponseType(template.getResponseType()));
            item.setStatus("PENDING");
            checklistDAO.saveItem(item);
        }
    }

    @Transactional(readOnly = true)
    public void validateAssignmentCanComplete(MaintenanceAssignment assignment) {
        if (!checklistProperties.isEnabled() || !checklistProperties.isRequireRequiredStepsBeforeCompletion()) {
            return;
        }
        List<MaintenanceAssignmentChecklistItem> items = checklistDAO.findByAssignmentId(assignment.getId());
        for (MaintenanceAssignmentChecklistItem item : items) {
            boolean required = Boolean.TRUE.equals(item.getRequired());
            if (required && !("COMPLETED".equalsIgnoreCase(item.getStatus()) || "NOT_APPLICABLE".equalsIgnoreCase(item.getStatus()))) {
                throw new InvalidOperationException("Complete required checklist item before closing assignment: " + item.getTaskTitle());
            }
            if (required
                    && Boolean.TRUE.equals(item.getProofRequired())
                    && checklistProperties.isRequireProofWhenStepRequiresProof()
                    && checklistDAO.countProofsByItemId(item.getId()) == 0) {
                throw new InvalidOperationException("Upload proof for required checklist item before closing assignment: " + item.getTaskTitle());
            }
        }
    }

    private void apply(MaintenanceAssignmentChecklistItem item, MaintenanceAssignmentChecklistItemDTO dto) {
        if (dto == null) {
            throw new InvalidOperationException("Checklist item is required");
        }
        if (dto.getTaskTitle() == null || dto.getTaskTitle().isBlank()) {
            throw new InvalidOperationException("Checklist task title is required");
        }
        item.setSequenceNumber(dto.getSequenceNumber());
        item.setTaskTitle(dto.getTaskTitle().trim());
        item.setInstructions(blankToNull(dto.getInstructions()));
        item.setRequired(dto.getRequired() == null || dto.getRequired());
        item.setProofRequired(Boolean.TRUE.equals(dto.getProofRequired()));
        item.setResponseType(defaultResponseType(dto.getResponseType()));
        item.setResponseValue(blankToNull(dto.getResponseValue()));
        item.setRemarks(blankToNull(dto.getRemarks()));
    }

    private MaintenanceAssignmentChecklistItem getOwnedItem(Long assignmentId, Long itemId) {
        MaintenanceAssignment assignment = getAssignment(assignmentId);
        validateAssignmentSite(assignment);
        MaintenanceAssignmentChecklistItem item = checklistDAO.findItemById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));
        if (item.getAssignment() == null || !assignmentId.equals(item.getAssignment().getId())) {
            throw new ResourceNotFoundException("Checklist item not found with id: " + itemId);
        }
        return item;
    }

    private MaintenanceAssignment getAssignment(Long assignmentId) {
        return assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance assignment not found with id: " + assignmentId));
    }

    private void validateAssignmentSite(MaintenanceAssignment assignment) {
        Long siteId = assignment.getRequest() == null || assignment.getRequest().getSite() == null
                ? null
                : assignment.getRequest().getSite().getId();
        accessControlService.validateSiteAccess(siteId);
    }

    private void validateProofFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Proof file is required");
        }
        long maxBytes = Math.max(checklistProperties.getMaxProofFileSizeMb(), 1) * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new InvalidOperationException("Proof file exceeds maximum size of " + checklistProperties.getMaxProofFileSizeMb() + " MB");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        boolean allowed = checklistProperties.getAllowedProofContentTypes().stream()
                .map((type) -> type.toLowerCase(Locale.ROOT))
                .anyMatch(contentType::equals);
        if (!allowed) {
            throw new InvalidOperationException("Proof file type is not allowed");
        }
    }

    private Path storeProofFile(Long assignmentId, Long itemId, MultipartFile file) {
        try {
            Files.createDirectories(proofDirectory());
            String extension = extension(file.getOriginalFilename());
            String storedName = "assignment-" + assignmentId + "-item-" + itemId + "-" + UUID.randomUUID() + extension;
            Path target = proofDirectory().resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException ex) {
            throw new InvalidOperationException("Unable to store checklist proof file");
        }
    }

    private Path proofDirectory() {
        return Path.of(fileStorageConfig.getPath()).resolve("assignment-checklist-proof").toAbsolutePath().normalize();
    }

    private String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".bin";
        }
        String ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return ext.matches("\\.(png|jpg|jpeg|webp|pdf)") ? ext : ".bin";
    }

    private void deleteStoredProofQuietly(MaintenanceAssignmentChecklistProof proof) {
        try {
            Files.deleteIfExists(Path.of(proof.getStoredFilePath()).toAbsolutePath().normalize());
        } catch (IOException ignored) {
            // Metadata removal should not be blocked by a missing or locked file.
        }
    }

    private String normalizeStatus(String value) {
        String status = value == null || value.isBlank() ? "PENDING" : value.trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(status)) {
            throw new InvalidOperationException("Checklist status must be PENDING, COMPLETED, or NOT_APPLICABLE");
        }
        return status;
    }

    private String defaultResponseType(String value) {
        String responseType = value == null || value.isBlank() ? "CHECKBOX" : value.trim().toUpperCase(Locale.ROOT);
        if (!RESPONSE_TYPES.contains(responseType)) {
            throw new InvalidOperationException("Checklist response type must be CHECKBOX, TEXT, NUMBER, or PHOTO");
        }
        return responseType;
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private MaintenanceAssignmentChecklistItemDTO toDTO(MaintenanceAssignmentChecklistItem item) {
        return MaintenanceAssignmentChecklistItemDTO.builder()
                .id(item.getId())
                .assignmentId(item.getAssignment() == null ? null : item.getAssignment().getId())
                .sourcePmChecklistItemId(item.getSourcePmChecklistItem() == null ? null : item.getSourcePmChecklistItem().getId())
                .sequenceNumber(item.getSequenceNumber())
                .taskTitle(item.getTaskTitle())
                .instructions(item.getInstructions())
                .required(item.getRequired())
                .proofRequired(item.getProofRequired())
                .responseType(item.getResponseType())
                .status(item.getStatus())
                .responseValue(item.getResponseValue())
                .remarks(item.getRemarks())
                .completedById(item.getCompletedBy() == null ? null : item.getCompletedBy().getId())
                .completedByName(userName(item.getCompletedBy()))
                .completedAt(item.getCompletedAt())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .proofs(checklistDAO.findProofsByItemId(item.getId()).stream().map(this::toProofDTO).collect(Collectors.toList()))
                .build();
    }

    private MaintenanceAssignmentChecklistProofDTO toProofDTO(MaintenanceAssignmentChecklistProof proof) {
        return MaintenanceAssignmentChecklistProofDTO.builder()
                .id(proof.getId())
                .checklistItemId(proof.getChecklistItem() == null ? null : proof.getChecklistItem().getId())
                .originalFileName(proof.getOriginalFileName())
                .contentType(proof.getContentType())
                .fileSize(proof.getFileSize())
                .uploadedById(proof.getUploadedBy() == null ? null : proof.getUploadedBy().getId())
                .uploadedByName(userName(proof.getUploadedBy()))
                .uploadedAt(proof.getUploadedAt())
                .build();
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
