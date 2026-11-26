package com.example.cmmsApplication.assignment.service;

import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import java.util.List;

/** Service contract for maintenance assignment. */
public interface MaintenanceAssignmentService {
    MaintenanceAssignmentDTO create(MaintenanceAssignmentDTO dto);

    MaintenanceAssignmentDTO update(Long id, MaintenanceAssignmentDTO dto);

    MaintenanceAssignmentDTO getById(Long id);

    List<MaintenanceAssignmentDTO> getAll(Long siteId);

    List<MaintenanceAssignmentDTO> getMyAssignments();

    void delete(Long id);

    MaintenanceAssignment getEntity(Long id);
}
