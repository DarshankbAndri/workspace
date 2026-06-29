package com.example.cmmsApplication.assignment.service;

import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentWorkLogDAO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentWorkLogAttachmentDTO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentWorkLogDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLog;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLogAttachment;
import com.example.cmmsApplication.common.config.FileStorageConfig;
import com.example.cmmsApplication.common.config.MaintenanceChecklistProperties;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.employee.dao.EmployeeDAO;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.employee.entity.EmployeeSiteAssignment;
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
public class MaintenanceAssignmentWorkLogService {
    private static final Set<String> COMPLETION_STATUSES = Set.of("IN_PROGRESS", "COMPLETED", "FOLLOW_UP_REQUIRED", "CANCELLED");

    private final MaintenanceAssignmentWorkLogDAO workLogDAO;
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final EmployeeDAO employeeDAO;
    private final AccessControlService accessControlService;
    private final MaintenanceChecklistProperties checklistProperties;
    private final FileStorageConfig fileStorageConfig;

    @Transactional(readOnly = true)
    public List<MaintenanceAssignmentWorkLogDTO> getWorkLogs(Long assignmentId) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_VIEW");
        MaintenanceAssignment assignment = getAssignment(assignmentId);
        validateAssignmentSite(assignment);
        return workLogDAO.findByAssignmentId(assignmentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MaintenanceAssignmentWorkLogDTO addWorkLog(Long assignmentId, MaintenanceAssignmentWorkLogDTO dto) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_CREATE");
        MaintenanceAssignment assignment = getAssignment(assignmentId);
        validateAssignmentSite(assignment);
        MaintenanceAssignmentWorkLog workLog = new MaintenanceAssignmentWorkLog();
        workLog.setAssignment(assignment);
        apply(workLog, dto, assignmentSiteId(assignment));
        User user = accessControlService.getCurrentUser();
        workLog.setCreatedBy(user);
        workLog.setUpdatedBy(user);
        return toDTO(workLogDAO.save(workLog));
    }

    public MaintenanceAssignmentWorkLogDTO updateWorkLog(Long assignmentId, Long workLogId, MaintenanceAssignmentWorkLogDTO dto) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_UPDATE");
        MaintenanceAssignmentWorkLog workLog = getOwnedWorkLog(assignmentId, workLogId);
        apply(workLog, dto, assignmentSiteId(workLog.getAssignment()));
        workLog.setUpdatedBy(accessControlService.getCurrentUser());
        return toDTO(workLogDAO.save(workLog));
    }

    public void deleteWorkLog(Long assignmentId, Long workLogId) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_DELETE");
        MaintenanceAssignmentWorkLog workLog = getOwnedWorkLog(assignmentId, workLogId);
        workLogDAO.findAttachmentsByWorkLogId(workLog.getId()).forEach(this::deleteStoredAttachmentQuietly);
        workLogDAO.deleteAttachmentsByWorkLogId(workLog.getId());
        workLogDAO.delete(workLog);
    }

    public MaintenanceAssignmentWorkLogAttachmentDTO uploadAttachment(Long assignmentId, Long workLogId, MultipartFile file) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD");
        if (!checklistProperties.isProofUploadsEnabled()) {
            throw new InvalidOperationException("Work log attachment uploads are disabled");
        }
        MaintenanceAssignmentWorkLog workLog = getOwnedWorkLog(assignmentId, workLogId);
        validateAttachmentFile(file);
        Path target = storeAttachmentFile(assignmentId, workLogId, file);

        MaintenanceAssignmentWorkLogAttachment attachment = new MaintenanceAssignmentWorkLogAttachment();
        attachment.setWorkLog(workLog);
        attachment.setOriginalFileName(file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename());
        attachment.setStoredFileName(target.getFileName().toString());
        attachment.setStoredFilePath(target.toString());
        attachment.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setUploadedBy(accessControlService.getCurrentUser());
        return toAttachmentDTO(workLogDAO.saveAttachment(attachment));
    }

    @Transactional(readOnly = true)
    public MaintenanceAssignmentWorkLogAttachment getAttachment(Long assignmentId, Long workLogId, Long attachmentId) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_VIEW");
        getOwnedWorkLog(assignmentId, workLogId);
        MaintenanceAssignmentWorkLogAttachment attachment = workLogDAO.findAttachmentById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Work log attachment not found with id: " + attachmentId));
        if (attachment.getWorkLog() == null || !workLogId.equals(attachment.getWorkLog().getId())) {
            throw new ResourceNotFoundException("Work log attachment not found with id: " + attachmentId);
        }
        return attachment;
    }

    @Transactional(readOnly = true)
    public Resource getAttachmentResource(MaintenanceAssignmentWorkLogAttachment attachment) {
        try {
            Path attachmentPath = Path.of(attachment.getStoredFilePath()).toAbsolutePath().normalize();
            if (!attachmentPath.startsWith(attachmentDirectory())) {
                throw new ResourceNotFoundException("Work log attachment not found");
            }
            Resource resource = new UrlResource(attachmentPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Work log attachment not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Work log attachment not found", ex);
        }
    }

    public void deleteAttachment(Long assignmentId, Long workLogId, Long attachmentId) {
        accessControlService.validatePermission("ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE");
        MaintenanceAssignmentWorkLogAttachment attachment = getAttachment(assignmentId, workLogId, attachmentId);
        deleteStoredAttachmentQuietly(attachment);
        workLogDAO.deleteAttachment(attachment);
    }

    @Transactional(readOnly = true)
    public void validateAssignmentCanComplete(MaintenanceAssignment assignment) {
        if (workLogDAO.countCompletedByAssignmentId(assignment.getId()) == 0) {
            throw new InvalidOperationException("Add at least one completed technician work log before completing the assignment");
        }
        if (workLogDAO.countBlockingByAssignmentId(assignment.getId()) > 0) {
            throw new InvalidOperationException("Resolve in-progress or follow-up work logs before completing the assignment");
        }
    }

    private void apply(MaintenanceAssignmentWorkLog workLog, MaintenanceAssignmentWorkLogDTO dto, Long assignmentSiteId) {
        if (dto == null) {
            throw new InvalidOperationException("Work log is required");
        }
        Employee technician = validateTechnician(dto.getTechnicianEmployeeId(), assignmentSiteId);
        workLog.setTechnician(technician);
        if (dto.getStartTime() == null) {
            throw new InvalidOperationException("Start time is required");
        }
        workLog.setStartTime(dto.getStartTime());
        workLog.setEndTime(dto.getEndTime());
        String status = normalizeCompletionStatus(dto.getCompletionStatus());
        if ("COMPLETED".equals(status) && dto.getEndTime() == null) {
            throw new InvalidOperationException("End time is required when work log is completed");
        }
        if (dto.getEndTime() != null && dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new InvalidOperationException("End time cannot be before start time");
        }
        workLog.setCompletionStatus(status);
        workLog.setWorkNotes(blankToNull(dto.getWorkNotes()));
        workLog.setIssueFound(blankToNull(dto.getIssueFound()));
        workLog.setActionTaken(blankToNull(dto.getActionTaken()));
    }

    private Employee validateTechnician(Long employeeId, Long assignmentSiteId) {
        if (employeeId == null) {
            throw new InvalidOperationException("Technician is required");
        }
        Employee employee = employeeDAO.findWithSiteAssignmentsById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new InvalidOperationException("Selected technician is inactive");
        }
        boolean assignedToSite = employee.getSiteAssignments().stream()
                .anyMatch((assignment) -> isActiveSiteAssignment(assignment, assignmentSiteId));
        if (!assignedToSite) {
            throw new InvalidOperationException("Selected technician is not assigned to the assignment site");
        }
        return employee;
    }

    private boolean isActiveSiteAssignment(EmployeeSiteAssignment assignment, Long siteId) {
        return assignment.getSite() != null
                && siteId != null
                && siteId.equals(assignment.getSite().getId())
                && !"INACTIVE".equalsIgnoreCase(assignment.getStatus());
    }

    private MaintenanceAssignmentWorkLog getOwnedWorkLog(Long assignmentId, Long workLogId) {
        MaintenanceAssignment assignment = getAssignment(assignmentId);
        validateAssignmentSite(assignment);
        MaintenanceAssignmentWorkLog workLog = workLogDAO.findById(workLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found with id: " + workLogId));
        if (workLog.getAssignment() == null || !assignmentId.equals(workLog.getAssignment().getId())) {
            throw new ResourceNotFoundException("Work log not found with id: " + workLogId);
        }
        return workLog;
    }

    private MaintenanceAssignment getAssignment(Long assignmentId) {
        return assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance assignment not found with id: " + assignmentId));
    }

    private void validateAssignmentSite(MaintenanceAssignment assignment) {
        accessControlService.validateSiteAccess(assignmentSiteId(assignment));
    }

    private Long assignmentSiteId(MaintenanceAssignment assignment) {
        return assignment.getRequest() == null || assignment.getRequest().getSite() == null
                ? null
                : assignment.getRequest().getSite().getId();
    }

    private void validateAttachmentFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Attachment file is required");
        }
        long maxBytes = Math.max(checklistProperties.getMaxProofFileSizeMb(), 1) * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new InvalidOperationException("Attachment file exceeds maximum size of " + checklistProperties.getMaxProofFileSizeMb() + " MB");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        boolean allowed = checklistProperties.getAllowedProofContentTypes().stream()
                .map((type) -> type.toLowerCase(Locale.ROOT))
                .anyMatch(contentType::equals);
        if (!allowed) {
            throw new InvalidOperationException("Attachment file type is not allowed");
        }
    }

    private Path storeAttachmentFile(Long assignmentId, Long workLogId, MultipartFile file) {
        try {
            Files.createDirectories(attachmentDirectory());
            String extension = extension(file.getOriginalFilename());
            String storedName = "assignment-" + assignmentId + "-work-log-" + workLogId + "-" + UUID.randomUUID() + extension;
            Path target = attachmentDirectory().resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException ex) {
            throw new InvalidOperationException("Unable to store work log attachment file");
        }
    }

    private Path attachmentDirectory() {
        return Path.of(fileStorageConfig.getPath()).resolve("assignment-work-log-attachment").toAbsolutePath().normalize();
    }

    private String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".bin";
        }
        String ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return ext.matches("\\.(png|jpg|jpeg|webp|pdf)") ? ext : ".bin";
    }

    private void deleteStoredAttachmentQuietly(MaintenanceAssignmentWorkLogAttachment attachment) {
        try {
            Files.deleteIfExists(Path.of(attachment.getStoredFilePath()).toAbsolutePath().normalize());
        } catch (IOException ignored) {
            // Metadata removal should not be blocked by a missing or locked file.
        }
    }

    private String normalizeCompletionStatus(String value) {
        String status = value == null || value.isBlank() ? "IN_PROGRESS" : value.trim().toUpperCase(Locale.ROOT);
        if (!COMPLETION_STATUSES.contains(status)) {
            throw new InvalidOperationException("Completion status must be IN_PROGRESS, COMPLETED, FOLLOW_UP_REQUIRED, or CANCELLED");
        }
        return status;
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private MaintenanceAssignmentWorkLogDTO toDTO(MaintenanceAssignmentWorkLog workLog) {
        return MaintenanceAssignmentWorkLogDTO.builder()
                .id(workLog.getId())
                .assignmentId(workLog.getAssignment() == null ? null : workLog.getAssignment().getId())
                .technicianEmployeeId(workLog.getTechnician() == null ? null : workLog.getTechnician().getId())
                .technicianEmployeeCode(workLog.getTechnician() == null ? null : workLog.getTechnician().getEmployeeCode())
                .technicianName(employeeName(workLog.getTechnician()))
                .startTime(workLog.getStartTime())
                .endTime(workLog.getEndTime())
                .workNotes(workLog.getWorkNotes())
                .issueFound(workLog.getIssueFound())
                .actionTaken(workLog.getActionTaken())
                .completionStatus(workLog.getCompletionStatus())
                .createdById(workLog.getCreatedBy() == null ? null : workLog.getCreatedBy().getId())
                .createdByName(userName(workLog.getCreatedBy()))
                .updatedById(workLog.getUpdatedBy() == null ? null : workLog.getUpdatedBy().getId())
                .updatedByName(userName(workLog.getUpdatedBy()))
                .createdAt(workLog.getCreatedAt())
                .updatedAt(workLog.getUpdatedAt())
                .attachments(workLogDAO.findAttachmentsByWorkLogId(workLog.getId()).stream().map(this::toAttachmentDTO).collect(Collectors.toList()))
                .build();
    }

    private MaintenanceAssignmentWorkLogAttachmentDTO toAttachmentDTO(MaintenanceAssignmentWorkLogAttachment attachment) {
        return MaintenanceAssignmentWorkLogAttachmentDTO.builder()
                .id(attachment.getId())
                .workLogId(attachment.getWorkLog() == null ? null : attachment.getWorkLog().getId())
                .originalFileName(attachment.getOriginalFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .uploadedById(attachment.getUploadedBy() == null ? null : attachment.getUploadedBy().getId())
                .uploadedByName(userName(attachment.getUploadedBy()))
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }

    private String employeeName(Employee employee) {
        if (employee == null) {
            return null;
        }
        return (employee.getFirstName() + " " + (employee.getLastName() == null ? "" : employee.getLastName())).trim();
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
