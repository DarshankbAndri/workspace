package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.EquipmentDAO;
import com.example.cmmsApplication.dto.EquipmentDTO;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipmentService {
    private final EquipmentDAO equipmentDAO;
    private final SiteService siteService;

    public EquipmentService(EquipmentDAO equipmentDAO, SiteService siteService) {
        this.equipmentDAO = equipmentDAO;
        this.siteService = siteService;
    }

    public EquipmentDTO create(EquipmentDTO dto) {
        if (equipmentDAO.existsByEquipmentCode(dto.getEquipmentCode())) {
            throw new InvalidOperationException("Equipment code already exists: " + dto.getEquipmentCode());
        }
        Equipment equipment = new Equipment();
        apply(equipment, dto);
        return toDTO(equipmentDAO.save(equipment));
    }

    public EquipmentDTO update(Long id, EquipmentDTO dto) {
        Equipment equipment = getEntity(id);
        if (equipmentDAO.existsByEquipmentCodeAndIdNot(dto.getEquipmentCode(), id)) {
            throw new InvalidOperationException("Equipment code already exists: " + dto.getEquipmentCode());
        }
        apply(equipment, dto);
        return toDTO(equipmentDAO.save(equipment));
    }

    @Transactional(readOnly = true)
    public EquipmentDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<EquipmentDTO> getAll(Long siteId) {
        List<Equipment> equipment = siteId == null ? equipmentDAO.findAll() : equipmentDAO.findBySiteId(siteId);
        return equipment.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        getEntity(id);
        equipmentDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Equipment getEntity(Long id) {
        return equipmentDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
    }

    private void apply(Equipment equipment, EquipmentDTO dto) {
        Site site = validateActiveSite(dto.getSiteId());
        equipment.setSite(site);
        equipment.setEquipmentCode(dto.getEquipmentCode());
        equipment.setEquipmentName(dto.getEquipmentName());
        equipment.setCategory(dto.getCategory());
        equipment.setLocation(dto.getLocation());
        equipment.setManufacturer(dto.getManufacturer());
        equipment.setModelNumber(dto.getModelNumber());
        equipment.setSerialNumber(dto.getSerialNumber());
        equipment.setInstallationDate(dto.getInstallationDate());
        equipment.setWarrantyExpiryDate(dto.getWarrantyExpiryDate());
        equipment.setStatus(dto.getStatus() == null ? "ACTIVE" : dto.getStatus());
        equipment.setCriticality(dto.getCriticality() == null ? "MEDIUM" : dto.getCriticality());
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

    private EquipmentDTO toDTO(Equipment equipment) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(equipment.getId());
        dto.setEquipmentCode(equipment.getEquipmentCode());
        dto.setEquipmentName(equipment.getEquipmentName());
        dto.setSiteId(equipment.getSite() == null ? null : equipment.getSite().getId());
        dto.setSiteCode(equipment.getSite() == null ? null : equipment.getSite().getSiteCode());
        dto.setSiteName(equipment.getSite() == null ? null : equipment.getSite().getSiteName());
        dto.setCategory(equipment.getCategory());
        dto.setLocation(equipment.getLocation());
        dto.setManufacturer(equipment.getManufacturer());
        dto.setModelNumber(equipment.getModelNumber());
        dto.setSerialNumber(equipment.getSerialNumber());
        dto.setInstallationDate(equipment.getInstallationDate());
        dto.setWarrantyExpiryDate(equipment.getWarrantyExpiryDate());
        dto.setStatus(equipment.getStatus());
        dto.setCriticality(equipment.getCriticality());
        dto.setCreatedAt(equipment.getCreatedAt());
        dto.setUpdatedAt(equipment.getUpdatedAt());
        return dto;
    }
}
