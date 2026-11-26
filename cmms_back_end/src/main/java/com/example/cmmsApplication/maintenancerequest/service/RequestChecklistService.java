package com.example.cmmsApplication.maintenancerequest.service;
import com.example.cmmsApplication.maintenancerequest.dao.RequestChecklistItemDAO;
import com.example.cmmsApplication.maintenancerequest.dto.RequestChecklistItemDTO;
import com.example.cmmsApplication.maintenancerequest.entity.*;
import com.example.cmmsApplication.equipment.service.EquipmentChecklistService;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor @Transactional
public class RequestChecklistService {
    private final RequestChecklistItemDAO checklistItemDAO;
    private final EquipmentChecklistService equipmentChecklistService;
    public void saveChecklistItems(MaintenanceRequest owner, List<RequestChecklistItemDTO> rows) {
        List<RequestChecklistItem> existing = checklistItemDAO.findByOwnerId(owner.getId());
        if (rows == null) {
            for (RequestChecklistItem item : existing) if (Boolean.TRUE.equals(item.getActive()))
                equipmentChecklistService.validateSource(owner.getEquipment().getId(), item.getSourceEquipmentChecklistItemId(), true);
            return;
        }
        java.util.Set<Long> retained = new java.util.HashSet<>(), sources = new java.util.HashSet<>();
        int sequence = 1;
        for (RequestChecklistItemDTO dto : rows) {
            if (dto == null) throw new InvalidOperationException("Checklist step is required");
            com.example.cmmsApplication.equipment.service.EquipmentChecklistService.validateStep(dto.getTaskTitle(), dto.getInstructions(), dto.getResponseType());
            RequestChecklistItem item = dto.getId() == null ? new RequestChecklistItem() : existing.stream().filter(i -> i.getId().equals(dto.getId()))
                .findFirst().orElseThrow(() -> new InvalidOperationException("Checklist step does not belong to this record"));
            if (item.getId() != null && !retained.add(item.getId())) throw new InvalidOperationException("Duplicate checklist step");
            Long sourceId = dto.getSourceEquipmentChecklistItemId();
            if (sourceId != null && !sources.add(sourceId)) throw new InvalidOperationException("Duplicate equipment checklist step");
            boolean sameSource = item.getId() != null && java.util.Objects.equals(item.getSourceEquipmentChecklistItemId(), sourceId);
            var source = equipmentChecklistService.validateSource(owner.getEquipment().getId(), sourceId, sameSource);
            if (!sameSource) item.setSourceChecklistName(source == null || source.getChecklist() == null ? null : source.getChecklist().getName());
            item.setSourceEquipmentChecklistItemId(sourceId);
            item.setRequest(owner); item.setSequenceNumber(sequence++); item.setTaskTitle(dto.getTaskTitle().trim()); item.setInstructions(dto.getInstructions());
            item.setRequired(dto.getRequired() == null || dto.getRequired()); item.setProofRequired(Boolean.TRUE.equals(dto.getProofRequired()));
            item.setResponseType(com.example.cmmsApplication.equipment.service.EquipmentChecklistService.responseType(dto.getResponseType())); item.setActive(true);
            checklistItemDAO.save(item);
        }
        existing.stream().filter(i -> !retained.contains(i.getId())).forEach(i -> { i.setActive(false); checklistItemDAO.save(i); });
    }

    public void copyFromPm(MaintenanceRequest request, List<com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem> templates) {
        for (var template : templates) {
            RequestChecklistItem item = new RequestChecklistItem();
            item.setRequest(request); item.setSequenceNumber(template.getSequenceNumber());
            item.setSourceEquipmentChecklistItemId(template.getSourceEquipmentChecklistItemId());
            item.setSourceChecklistName(template.getSourceChecklistName());
            item.setTaskTitle(template.getTaskTitle()); item.setInstructions(template.getInstructions());
            item.setRequired(template.getRequired()); item.setProofRequired(template.getProofRequired());
            item.setResponseType(template.getResponseType()); item.setActive(true);
            checklistItemDAO.save(item);
        }
    }

    public List<RequestChecklistItemDTO> get(Long requestId) {
        return checklistItemDAO.findByOwnerId(requestId).stream().filter(i -> Boolean.TRUE.equals(i.getActive())).map(i ->
            RequestChecklistItemDTO.builder().id(i.getId()).sourceEquipmentChecklistItemId(i.getSourceEquipmentChecklistItemId())
            .sourceChecklistName(i.getSourceChecklistName()).sequenceNumber(i.getSequenceNumber()).taskTitle(i.getTaskTitle())
            .instructions(i.getInstructions()).required(i.getRequired()).proofRequired(i.getProofRequired()).responseType(i.getResponseType()).active(i.getActive()).build()).toList();
    }
}
