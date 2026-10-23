package com.example.cmmsApplication.downtime.service;

import com.example.cmmsApplication.downtime.dto.DowntimeRcaActionDTO;
import com.example.cmmsApplication.downtime.dto.DowntimeStatusHistoryDTO;
import com.example.cmmsApplication.downtime.dto.DowntimeTransitionDTO;
import com.example.cmmsApplication.downtime.dto.EquipmentDowntimeDTO;
import java.util.List;

/** Service contract for equipment downtime. */
public interface EquipmentDowntimeService {
    EquipmentDowntimeDTO create(EquipmentDowntimeDTO dto);

    EquipmentDowntimeDTO update(Long id, EquipmentDowntimeDTO dto);

    EquipmentDowntimeDTO confirm(Long id, DowntimeTransitionDTO dto);

    EquipmentDowntimeDTO startMaintenance(Long id, DowntimeTransitionDTO dto);

    EquipmentDowntimeDTO restore(Long id, DowntimeTransitionDTO dto);

    EquipmentDowntimeDTO verify(Long id, DowntimeTransitionDTO dto);

    EquipmentDowntimeDTO close(Long id, DowntimeTransitionDTO dto);

    EquipmentDowntimeDTO reopen(Long id, DowntimeTransitionDTO dto);

    EquipmentDowntimeDTO getById(Long id);

    List<EquipmentDowntimeDTO> getAll(Long siteId, Long equipmentId);

    List<EquipmentDowntimeDTO> getByEquipmentId(Long equipmentId);

    List<DowntimeStatusHistoryDTO> getTimeline(Long id);

    List<DowntimeRcaActionDTO> getRcaActions(Long id);

    DowntimeRcaActionDTO addRcaAction(Long id, DowntimeRcaActionDTO dto);

    DowntimeRcaActionDTO updateRcaAction(Long id, Long actionId, DowntimeRcaActionDTO dto);

    void delete(Long id);
}
