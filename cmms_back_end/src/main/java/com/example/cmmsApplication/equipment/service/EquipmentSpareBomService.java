package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.equipment.dto.EquipmentSpareBomDTO;
import java.util.List;

/** Service contract for equipment spare bom. */
public interface EquipmentSpareBomService {
    List<EquipmentSpareBomDTO> getByEquipment(Long equipmentId);

    List<EquipmentSpareBomDTO> getByStock(Long stockId);

    EquipmentSpareBomDTO create(Long equipmentId, EquipmentSpareBomDTO dto);

    EquipmentSpareBomDTO createForStock(Long stockId, EquipmentSpareBomDTO dto);

    EquipmentSpareBomDTO update(Long equipmentId, Long bomId, EquipmentSpareBomDTO dto);

    EquipmentSpareBomDTO updateForStock(Long stockId, Long bomId, EquipmentSpareBomDTO dto);

    void delete(Long equipmentId, Long bomId);

    void deleteForStock(Long stockId, Long bomId);
}
