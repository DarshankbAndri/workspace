package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.EquipmentDowntimeDAO;
import com.example.cmmsApplication.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.entity.EquipmentDowntime;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipmentDowntimeService {
    private final EquipmentDowntimeDAO downtimeDAO;
    private final EquipmentService equipmentService;
    private final MaintenanceRequestService requestService;

    public EquipmentDowntimeService(EquipmentDowntimeDAO downtimeDAO, EquipmentService equipmentService, MaintenanceRequestService requestService) {
        this.downtimeDAO = downtimeDAO;
        this.equipmentService = equipmentService;
        this.requestService = requestService;
    }

    public EquipmentDowntimeDTO create(EquipmentDowntimeDTO dto) {
        EquipmentDowntime downtime = new EquipmentDowntime();
        apply(downtime, dto);
        return toDTO(downtimeDAO.save(downtime));
    }

    public EquipmentDowntimeDTO update(Long id, EquipmentDowntimeDTO dto) {
        EquipmentDowntime downtime = getEntity(id);
        apply(downtime, dto);
        return toDTO(downtimeDAO.save(downtime));
    }

    @Transactional(readOnly = true)
    public EquipmentDowntimeDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<EquipmentDowntimeDTO> getAll() {
        return downtimeDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EquipmentDowntimeDTO> getByEquipmentId(Long equipmentId) {
        equipmentService.getEntity(equipmentId);
        return downtimeDAO.findByEquipmentId(equipmentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        getEntity(id);
        downtimeDAO.deleteById(id);
    }

    private EquipmentDowntime getEntity(Long id) {
        return downtimeDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment downtime not found with id: " + id));
    }

    private void apply(EquipmentDowntime downtime, EquipmentDowntimeDTO dto) {
        if (dto.getDowntimeStart() != null && dto.getDowntimeEnd() != null && !dto.getDowntimeEnd().isAfter(dto.getDowntimeStart())) {
            throw new InvalidOperationException("Downtime end must be after downtime start");
        }
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        downtime.setEquipment(equipment);
        MaintenanceRequest request = dto.getRequestId() == null ? null : requestService.getEntity(dto.getRequestId());
        downtime.setRequest(request);
        downtime.setDowntimeStart(dto.getDowntimeStart());
        downtime.setDowntimeEnd(dto.getDowntimeEnd());
        downtime.setReason(dto.getReason());
        downtime.setPlanned(dto.getPlanned() != null && dto.getPlanned());
        downtime.setRemarks(dto.getRemarks());
    }

    private EquipmentDowntimeDTO toDTO(EquipmentDowntime downtime) {
        EquipmentDowntimeDTO dto = new EquipmentDowntimeDTO();
        dto.setId(downtime.getId());
        dto.setEquipmentId(downtime.getEquipment().getId());
        dto.setEquipmentCode(downtime.getEquipment().getEquipmentCode());
        dto.setEquipmentName(downtime.getEquipment().getEquipmentName());
        dto.setRequestId(downtime.getRequest() == null ? null : downtime.getRequest().getId());
        dto.setRequestNumber(downtime.getRequest() == null ? null : downtime.getRequest().getRequestNumber());
        dto.setDowntimeStart(downtime.getDowntimeStart());
        dto.setDowntimeEnd(downtime.getDowntimeEnd());
        dto.setDowntimeMinutes(downtime.getDowntimeMinutes());
        dto.setDowntimeHours(downtime.getDowntimeHours());
        dto.setDowntimeDays(downtime.getDowntimeDays());
        dto.setReason(downtime.getReason());
        dto.setPlanned(downtime.getPlanned());
        dto.setRemarks(downtime.getRemarks());
        dto.setCreatedAt(downtime.getCreatedAt());
        dto.setUpdatedAt(downtime.getUpdatedAt());
        return dto;
    }
}
