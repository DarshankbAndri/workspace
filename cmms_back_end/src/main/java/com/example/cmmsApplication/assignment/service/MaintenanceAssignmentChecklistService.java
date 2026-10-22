package com.example.cmmsApplication.assignment.service;

import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentChecklistItemDTO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentChecklistProofDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistProof;
import com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/** Service contract for maintenance assignment checklist. */
public interface MaintenanceAssignmentChecklistService {
    List<MaintenanceAssignmentChecklistItemDTO> getChecklist(Long assignmentId);

    MaintenanceAssignmentChecklistItemDTO addItem(Long assignmentId, MaintenanceAssignmentChecklistItemDTO dto);

    MaintenanceAssignmentChecklistItemDTO updateItem(Long assignmentId, Long itemId, MaintenanceAssignmentChecklistItemDTO dto);

    void deleteItem(Long assignmentId, Long itemId);

    MaintenanceAssignmentChecklistProofDTO uploadProof(Long assignmentId, Long itemId, MultipartFile file);

    MaintenanceAssignmentChecklistProof getProof(Long assignmentId, Long itemId, Long proofId);

    Resource getProofResource(MaintenanceAssignmentChecklistProof proof);

    void deleteProof(Long assignmentId, Long itemId, Long proofId);

    void copyFromPmTemplate(MaintenanceAssignment assignment, List<PmScheduleChecklistItem> templates);

    void copyFromRequest(MaintenanceAssignment assignment);

    void validateAssignmentCanComplete(MaintenanceAssignment assignment);
}
