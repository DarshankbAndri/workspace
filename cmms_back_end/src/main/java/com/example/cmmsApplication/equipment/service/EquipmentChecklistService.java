package com.example.cmmsApplication.equipment.service;
import com.example.cmmsApplication.equipment.dao.*;
import com.example.cmmsApplication.equipment.dto.*;
import com.example.cmmsApplication.equipment.entity.*;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor @Transactional
public class EquipmentChecklistService {
    private final EquipmentChecklistDAO checklistDAO;
    private final EquipmentChecklistItemDAO itemDAO;
    private final EquipmentDAO equipmentDAO;
    private final AccessControlService accessControlService;

    @Transactional(readOnly = true)
    public EquipmentChecklistsDTO get(Long equipmentId) {
        Equipment equipment = equipmentDAO.findById(equipmentId).orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        List<EquipmentChecklistItem> items = itemDAO.findByOwnerId(equipmentId).stream().filter(i -> Boolean.TRUE.equals(i.getActive())).toList();
        return EquipmentChecklistsDTO.builder()
            .groups(checklistDAO.findByEquipmentId(equipmentId).stream().filter(g -> Boolean.TRUE.equals(g.getActive())).map(g ->
                EquipmentChecklistDTO.builder().id(g.getId()).name(g.getName()).items(items.stream()
                    .filter(i -> i.getChecklist() != null && g.getId().equals(i.getChecklist().getId())).map(this::toDTO).toList()).build()).toList())
            .standaloneItems(items.stream().filter(i -> i.getChecklist() == null).map(this::toDTO).toList()).build();
    }

    public void save(Equipment equipment, EquipmentChecklistsDTO dto) {
        if (dto == null) return;
        List<EquipmentChecklist> groups = checklistDAO.findByEquipmentId(equipment.getId());
        List<EquipmentChecklistItem> items = itemDAO.findByOwnerId(equipment.getId());
        Set<Long> usedGroups = new HashSet<>(), usedItems = new HashSet<>();
        if (dto.getGroups() != null) {
            for (EquipmentChecklistDTO groupDTO : dto.getGroups()) {
                if (groupDTO == null || groupDTO.getName() == null || groupDTO.getName().isBlank() || groupDTO.getName().trim().length() > 200)
                    throw new InvalidOperationException("Checklist name is required and must be at most 200 characters");
                EquipmentChecklist group = groupDTO.getId() == null ? new EquipmentChecklist() : groups.stream()
                    .filter(g -> g.getId().equals(groupDTO.getId())).findFirst().orElseThrow(() -> new InvalidOperationException("Checklist does not belong to equipment"));
                if (group.getId() != null && !usedGroups.add(group.getId())) throw new InvalidOperationException("Duplicate checklist");
                group.setEquipment(equipment); group.setName(groupDTO.getName().trim()); group.setActive(true);
                checklistDAO.save(group);
                saveItems(equipment, group, groupDTO.getItems(), items, usedItems);
            }
            groups.stream().filter(g -> !usedGroups.contains(g.getId())).forEach(g -> { g.setActive(false); checklistDAO.save(g); });
            Set<Long> omittedGroups = new HashSet<>();
            groups.stream().filter(g -> !Boolean.TRUE.equals(g.getActive())).forEach(g -> omittedGroups.add(g.getId()));
            items.stream().filter(i -> i.getChecklist() != null && omittedGroups.contains(i.getChecklist().getId())).forEach(i -> { i.setActive(false); itemDAO.save(i); });
        }
        saveItems(equipment, null, dto.getStandaloneItems(), items, usedItems);
    }

    private void saveItems(Equipment equipment, EquipmentChecklist group, List<EquipmentChecklistItemDTO> rows, List<EquipmentChecklistItem> existing, Set<Long> used) {
        if (rows == null) return;
        Set<Long> retained = new HashSet<>();
        int sequence = 1;
        for (EquipmentChecklistItemDTO dto : rows) {
            if (dto == null) throw new InvalidOperationException("Checklist step is required");
            validateStep(dto.getTaskTitle(), dto.getInstructions(), dto.getResponseType());
            EquipmentChecklistItem item = dto.getId() == null ? new EquipmentChecklistItem() : existing.stream()
                .filter(i -> i.getId().equals(dto.getId())).findFirst().orElseThrow(() -> new InvalidOperationException("Step does not belong to equipment"));
            if (item.getId() != null && !used.add(item.getId())) throw new InvalidOperationException("Duplicate checklist step");
            item.setEquipment(equipment); item.setChecklist(group); item.setSequenceNumber(sequence++);
            item.setTaskTitle(dto.getTaskTitle().trim()); item.setInstructions(dto.getInstructions());
            item.setRequired(dto.getRequired() == null || dto.getRequired()); item.setProofRequired(Boolean.TRUE.equals(dto.getProofRequired()));
            item.setResponseType(responseType(dto.getResponseType())); item.setActive(true);
            itemDAO.save(item); retained.add(item.getId());
        }
        existing.stream().filter(i -> Objects.equals(i.getChecklist() == null ? null : i.getChecklist().getId(), group == null ? null : group.getId()))
            .filter(i -> !retained.contains(i.getId())).forEach(i -> { i.setActive(false); itemDAO.save(i); });
    }

    public EquipmentChecklistItem validateSource(Long equipmentId, Long sourceId, boolean existingSource) {
        if (sourceId == null) return null;
        EquipmentChecklistItem source = itemDAO.findById(sourceId).orElseThrow(() -> new InvalidOperationException("Equipment checklist step not found"));
        if (!equipmentId.equals(source.getEquipment().getId())) throw new InvalidOperationException("Checklist step does not belong to selected equipment");
        accessControlService.validateSiteAccess(source.getEquipment().getSite() == null ? null : source.getEquipment().getSite().getId());
        if (!existingSource && (!Boolean.TRUE.equals(source.getActive()) || (source.getChecklist() != null && !Boolean.TRUE.equals(source.getChecklist().getActive()))))
            throw new InvalidOperationException("Equipment checklist step is inactive");
        return source;
    }

    public static void validateStep(String title, String instructions, String type) {
        if (title == null || title.isBlank() || title.trim().length() > 200) throw new InvalidOperationException("Checklist title is required and must be at most 200 characters");
        if (instructions != null && instructions.length() > 1000) throw new InvalidOperationException("Checklist instructions must be at most 1000 characters");
        responseType(type);
    }
    public static String responseType(String type) {
        String result = type == null || type.isBlank() ? "CHECKBOX" : type.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("CHECKBOX", "TEXT", "NUMBER", "PHOTO").contains(result)) throw new InvalidOperationException("Invalid checklist response type");
        return result;
    }
    private EquipmentChecklistItemDTO toDTO(EquipmentChecklistItem i) {
        return EquipmentChecklistItemDTO.builder().id(i.getId()).sequenceNumber(i.getSequenceNumber()).taskTitle(i.getTaskTitle())
            .instructions(i.getInstructions()).required(i.getRequired()).proofRequired(i.getProofRequired()).responseType(i.getResponseType()).active(i.getActive()).build();
    }
}
