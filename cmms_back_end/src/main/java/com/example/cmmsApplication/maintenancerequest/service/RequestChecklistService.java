package com.example.cmmsApplication.maintenancerequest.service;

import com.example.cmmsApplication.maintenancerequest.dto.RequestChecklistItemDTO;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import java.util.List;

/** Service contract for request checklist. */
public interface RequestChecklistService {
    void saveChecklistItems(MaintenanceRequest owner, List<RequestChecklistItemDTO> rows);

    void copyFromPm(MaintenanceRequest request, List<com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem> templates);

    List<RequestChecklistItemDTO> get(Long requestId);
}
