package com.example.cmmsApplication.maintenancerequest.service;

import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestContextDTO;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestQueueSummaryDTO;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestRelatedRecordsDTO;
import com.example.cmmsApplication.maintenancerequest.dto.MaintenanceRequestTransitionDTO;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import java.util.List;

/** Service contract for maintenance request. */
public interface MaintenanceRequestService {
    MaintenanceRequestDTO create(MaintenanceRequestDTO dto);

    MaintenanceRequestDTO update(Long id, MaintenanceRequestDTO dto);

    MaintenanceRequestDTO transition(Long id, MaintenanceRequestTransitionDTO dto);

    MaintenanceRequestDTO getById(Long id);

    List<MaintenanceRequestDTO> getAll(Long siteId, String status);

    MaintenanceRequestContextDTO getContext(Long equipmentId);

    MaintenanceRequestQueueSummaryDTO getQueueSummary(Long siteId);

    MaintenanceRequestRelatedRecordsDTO getRelatedRecords(Long id);

    void delete(Long id);

    MaintenanceRequest getEntity(Long id);

    void validateWorkAllowed(MaintenanceRequest request);

    void syncStatusFromAssignment(MaintenanceRequest request, String assignmentStatus);
}
