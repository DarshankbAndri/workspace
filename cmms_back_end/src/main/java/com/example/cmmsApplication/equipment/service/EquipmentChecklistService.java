package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.equipment.dto.EquipmentChecklistsDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.entity.EquipmentChecklistItem;

/** Service contract for equipment checklist. */
public interface EquipmentChecklistService {
    EquipmentChecklistsDTO get(Long equipmentId);

    void save(Equipment equipment, EquipmentChecklistsDTO dto);

    EquipmentChecklistItem validateSource(Long equipmentId, Long sourceId, boolean existingSource);

    void validateStep(String title, String instructions, String type);

    String responseType(String type);
}
