package com.example.cmmsApplication.assignment.dao;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLog;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLogAttachment;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentWorkLogAttachmentRepository;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentWorkLogRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaintenanceAssignmentWorkLogDAO {
    private final MaintenanceAssignmentWorkLogRepository workLogRepository;
    private final MaintenanceAssignmentWorkLogAttachmentRepository attachmentRepository;

    public List<MaintenanceAssignmentWorkLog> findByAssignmentId(Long assignmentId) {
        return workLogRepository.findByAssignmentIdOrderByStartTimeDescIdDesc(assignmentId);
    }

    public Optional<MaintenanceAssignmentWorkLog> findById(Long id) {
        return workLogRepository.findById(id);
    }

    public MaintenanceAssignmentWorkLog save(MaintenanceAssignmentWorkLog workLog) {
        return workLogRepository.save(workLog);
    }

    public void delete(MaintenanceAssignmentWorkLog workLog) {
        workLogRepository.delete(workLog);
    }

    public long countByAssignmentId(Long assignmentId) {
        return workLogRepository.countByAssignmentId(assignmentId);
    }

    public long countCompletedByAssignmentId(Long assignmentId) {
        return workLogRepository.countByAssignmentIdAndCompletionStatus(assignmentId, "COMPLETED");
    }

    public long countBlockingByAssignmentId(Long assignmentId) {
        return workLogRepository.countByAssignmentIdAndCompletionStatusIn(assignmentId, List.of("IN_PROGRESS", "FOLLOW_UP_REQUIRED"));
    }

    public MaintenanceAssignmentWorkLogAttachment saveAttachment(MaintenanceAssignmentWorkLogAttachment attachment) {
        return attachmentRepository.save(attachment);
    }

    public Optional<MaintenanceAssignmentWorkLogAttachment> findAttachmentById(Long id) {
        return attachmentRepository.findById(id);
    }

    public List<MaintenanceAssignmentWorkLogAttachment> findAttachmentsByWorkLogId(Long workLogId) {
        return attachmentRepository.findByWorkLogIdOrderByUploadedAtDesc(workLogId);
    }

    public void deleteAttachment(MaintenanceAssignmentWorkLogAttachment attachment) {
        attachmentRepository.delete(attachment);
    }

    public void deleteAttachmentsByWorkLogId(Long workLogId) {
        attachmentRepository.deleteByWorkLogId(workLogId);
    }
}
