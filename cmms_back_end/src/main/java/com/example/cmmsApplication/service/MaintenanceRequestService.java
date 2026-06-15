package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceRequestService {
    private final MaintenanceRequestDAO requestDAO;
    private final EquipmentService equipmentService;
    private final SiteService siteService;
    private final AccessControlService accessControlService;

    public MaintenanceRequestService(MaintenanceRequestDAO requestDAO, EquipmentService equipmentService, SiteService siteService, AccessControlService accessControlService) {
        this.requestDAO = requestDAO;
        this.equipmentService = equipmentService;
        this.siteService = siteService;
        this.accessControlService = accessControlService;
    }

    public MaintenanceRequestDTO create(MaintenanceRequestDTO dto) {
        accessControlService.validatePermission("REQUEST_CREATE");
        accessControlService.validateSiteAccess(dto.getSiteId());
        MaintenanceRequest request = new MaintenanceRequest();
        apply(request, dto);
        if (request.getRequestNumber() == null || request.getRequestNumber().isBlank()) {
            request.setRequestNumber(generateRequestNumber());
        }
        if (requestDAO.existsByRequestNumber(request.getRequestNumber())) {
            throw new InvalidOperationException("Request number already exists: " + request.getRequestNumber());
        }
        return toDTO(requestDAO.save(request));
    }

    public MaintenanceRequestDTO update(Long id, MaintenanceRequestDTO dto) {
        accessControlService.validatePermission("REQUEST_UPDATE");
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        accessControlService.validateSiteAccess(dto.getSiteId());
        apply(request, dto);
        if (requestDAO.existsByRequestNumberAndIdNot(request.getRequestNumber(), id)) {
            throw new InvalidOperationException("Request number already exists: " + request.getRequestNumber());
        }
        return toDTO(requestDAO.save(request));
    }

    @Transactional(readOnly = true)
    public MaintenanceRequestDTO getById(Long id) {
        accessControlService.validatePermission("REQUEST_VIEW");
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        return toDTO(request);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRequestDTO> getAll(Long siteId, String status) {
        accessControlService.validatePermission("REQUEST_VIEW");
        List<MaintenanceRequest> requests;
        if (siteId != null && status != null && !status.isBlank()) {
            accessControlService.validateSiteAccess(siteId);
            requests = requestDAO.findBySiteIdAndStatus(siteId, status);
        } else if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
            requests = requestDAO.findBySiteId(siteId);
        } else if (status != null && !status.isBlank()) {
            requests = accessControlService.isAdmin() ? requestDAO.findByStatus(status) : requestDAO.findBySiteIdsAndStatus(accessControlService.getAllowedSiteIds(), status);
        } else {
            requests = accessControlService.isAdmin() ? requestDAO.findAll() : requestDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        }
        return requests.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        accessControlService.validatePermission("REQUEST_DELETE");
        MaintenanceRequest request = getEntity(id);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        requestDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public MaintenanceRequest getEntity(Long id) {
        return requestDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private void apply(MaintenanceRequest request, MaintenanceRequestDTO dto) {
        Site site = validateActiveSite(dto.getSiteId());
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        if (equipment.getSite() == null || !site.getId().equals(equipment.getSite().getId())) {
            throw new InvalidOperationException("Selected equipment does not belong to selected site");
        }
        request.setSite(site);
        request.setEquipment(equipment);
        if (dto.getRequestNumber() != null && !dto.getRequestNumber().isBlank()) {
            request.setRequestNumber(dto.getRequestNumber());
        }
        request.setRequestType(dto.getRequestType() == null ? "BREAKDOWN" : dto.getRequestType());
        request.setPriority(dto.getPriority() == null ? "MEDIUM" : dto.getPriority());
        request.setStatus(dto.getStatus() == null ? "OPEN" : dto.getStatus());
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setReportedBy(dto.getReportedBy());
        request.setRequestedDate(dto.getRequestedDate());
        request.setTargetCompletionDate(dto.getTargetCompletionDate());
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

    private String generateRequestNumber() {
        return "MR-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + System.currentTimeMillis();
    }

    private MaintenanceRequestDTO toDTO(MaintenanceRequest request) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        dto.setId(request.getId());
        dto.setRequestNumber(request.getRequestNumber());
        dto.setEquipmentId(request.getEquipment().getId());
        dto.setEquipmentCode(request.getEquipment().getEquipmentCode());
        dto.setEquipmentName(request.getEquipment().getEquipmentName());
        dto.setSiteId(request.getSite() == null ? null : request.getSite().getId());
        dto.setSiteCode(request.getSite() == null ? null : request.getSite().getSiteCode());
        dto.setSiteName(request.getSite() == null ? null : request.getSite().getSiteName());
        dto.setRequestType(request.getRequestType());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setReportedBy(request.getReportedBy());
        dto.setRequestedDate(request.getRequestedDate());
        dto.setTargetCompletionDate(request.getTargetCompletionDate());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
