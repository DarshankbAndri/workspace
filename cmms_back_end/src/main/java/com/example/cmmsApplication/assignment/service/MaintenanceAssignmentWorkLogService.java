package com.example.cmmsApplication.assignment.service;

import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentWorkLogAttachmentDTO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentWorkLogDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLogAttachment;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/** Service contract for maintenance assignment work log. */
public interface MaintenanceAssignmentWorkLogService {
    List<MaintenanceAssignmentWorkLogDTO> getWorkLogs(Long assignmentId);

    MaintenanceAssignmentWorkLogDTO addWorkLog(Long assignmentId, MaintenanceAssignmentWorkLogDTO dto);

    MaintenanceAssignmentWorkLogDTO updateWorkLog(Long assignmentId, Long workLogId, MaintenanceAssignmentWorkLogDTO dto);

    void deleteWorkLog(Long assignmentId, Long workLogId);

    MaintenanceAssignmentWorkLogAttachmentDTO uploadAttachment(Long assignmentId, Long workLogId, MultipartFile file);

    MaintenanceAssignmentWorkLogAttachment getAttachment(Long assignmentId, Long workLogId, Long attachmentId);

    Resource getAttachmentResource(MaintenanceAssignmentWorkLogAttachment attachment);

    void deleteAttachment(Long assignmentId, Long workLogId, Long attachmentId);

    void validateAssignmentCanComplete(MaintenanceAssignment assignment);
}
