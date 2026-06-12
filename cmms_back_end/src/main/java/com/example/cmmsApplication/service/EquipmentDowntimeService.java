package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.EquipmentDowntimeDAO;
import com.example.cmmsApplication.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.entity.EquipmentDowntime;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.entity.Site;
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
    private final SiteService siteService;

    public EquipmentDowntimeService(EquipmentDowntimeDAO downtimeDAO, EquipmentService equipmentService, MaintenanceRequestService requestService, SiteService siteService) {
        this.downtimeDAO = downtimeDAO;
        this.equipmentService = equipmentService;
        this.requestService = requestService;
        this.siteService = siteService;
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
    public List<EquipmentDowntimeDTO> getAll(Long siteId, Long equipmentId) {
        List<EquipmentDowntime> entries;
        if (siteId != null && equipmentId != null) {
            entries = downtimeDAO.findBySiteIdAndEquipmentId(siteId, equipmentId);
        } else if (siteId != null) {
            entries = downtimeDAO.findBySiteId(siteId);
        } else if (equipmentId != null) {
            entries = downtimeDAO.findByEquipmentId(equipmentId);
        } else {
            entries = downtimeDAO.findAll();
        }
        return entries.stream().map(this::toDTO).collect(Collectors.toList());
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
        Site site = validateActiveSite(dto.getSiteId());
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        if (equipment.getSite() == null || !site.getId().equals(equipment.getSite().getId())) {
            throw new InvalidOperationException("Selected equipment does not belong to selected site");
        }
        downtime.setSite(site);
        downtime.setEquipment(equipment);
        MaintenanceRequest request = dto.getRequestId() == null ? null : requestService.getEntity(dto.getRequestId());
        if (request != null && (request.getSite() == null || !site.getId().equals(request.getSite().getId()))) {
            throw new InvalidOperationException("Selected request does not belong to selected site");
        }
        if (request != null && !equipment.getId().equals(request.getEquipment().getId())) {
            throw new InvalidOperationException("Selected request does not belong to selected equipment");
        }
        downtime.setRequest(request);
        downtime.setDowntimeStart(dto.getDowntimeStart());
        downtime.setDowntimeEnd(dto.getDowntimeEnd());
        downtime.setReason(dto.getReason());
        downtime.setPlanned(dto.getPlanned() != null && dto.getPlanned());
        downtime.setRemarks(dto.getRemarks());
    }

    private Site validateActiveSite(Long siteId) {
        if (siteId == null) {
            throw new InvalidOperationException("Site is required");
        }
        Site site = siteService.getEntity(siteId);
        if (!"ACTIVE".equalsIgnoreCase(site.getStatus())) {
            throw new InvalidOperationException("Selected site is inactive");
        }
        return site;
    }

    private EquipmentDowntimeDTO toDTO(EquipmentDowntime downtime) {
        EquipmentDowntimeDTO dto = new EquipmentDowntimeDTO();
        dto.setId(downtime.getId());
        dto.setEquipmentId(downtime.getEquipment().getId());
        dto.setEquipmentCode(downtime.getEquipment().getEquipmentCode());
        dto.setEquipmentName(downtime.getEquipment().getEquipmentName());
        dto.setSiteId(downtime.getSite() == null ? null : downtime.getSite().getId());
        dto.setSiteCode(downtime.getSite() == null ? null : downtime.getSite().getSiteCode());
        dto.setSiteName(downtime.getSite() == null ? null : downtime.getSite().getSiteName());
        dto.setRequestId(downtime.getRequest() == null ? null : downtime.getRequest().getId());
        dto.setRequestNumber(downtime.getRequest() == null ? null : downtime.getRequest().getRequestNumber());
        dto.setRequestTitle(downtime.getRequest() == null ? null : downtime.getRequest().getTitle());
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
