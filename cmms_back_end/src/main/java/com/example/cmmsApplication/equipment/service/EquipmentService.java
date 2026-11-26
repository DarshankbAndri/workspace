package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.equipment.dto.EquipmentDTO;
import com.example.cmmsApplication.equipment.dto.EquipmentHealthDTO;
import com.example.cmmsApplication.equipment.dto.EquipmentSummaryDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import java.util.List;

/** Service contract for equipment. */
public interface EquipmentService {
    EquipmentDTO create(EquipmentDTO dto);

    EquipmentDTO update(Long id, EquipmentDTO dto);

    EquipmentDTO getById(Long id);

    List<EquipmentDTO> getAll(Long siteId);

    PageProperties searchEquipment(SearchDTO searchDTO);

    EquipmentSummaryDTO getSummary(Long id);

    EquipmentHealthDTO getHealth(Long id);

    void delete(Long id);

    Equipment getEntity(Long id);

    void validateCanReceiveWork(Equipment equipment);
}
