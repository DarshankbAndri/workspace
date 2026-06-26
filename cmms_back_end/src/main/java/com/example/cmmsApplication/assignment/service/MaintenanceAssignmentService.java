package com.example.cmmsApplication.assignment.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.maintenancerequest.service.MaintenanceRequestService;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.service.VendorService;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.dto.MaintenanceAssignmentDTO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceAssignmentService {
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final MaintenanceRequestService requestService;
    private final VendorService vendorService;
    private final AccessControlService accessControlService;
    private final MaintenanceAssignmentChecklistService checklistService;

    public MaintenanceAssignmentDTO create(MaintenanceAssignmentDTO dto) {
        accessControlService.validatePermission("ASSIGNMENT_CREATE");
        accessControlService.validateSiteAccess(dto.getSiteId());
        MaintenanceAssignment assignment = new MaintenanceAssignment();
        apply(assignment, dto);
        return toDTO(assignmentDAO.save(assignment));
    }

    public MaintenanceAssignmentDTO update(Long id, MaintenanceAssignmentDTO dto) {
        accessControlService.validatePermission("ASSIGNMENT_UPDATE");
        MaintenanceAssignment assignment = getEntity(id);
        Long currentSiteId = assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId();
        accessControlService.validateSiteAccess(currentSiteId);
        accessControlService.validateSiteAccess(dto.getSiteId());
        apply(assignment, dto);
        if ("COMPLETED".equalsIgnoreCase(assignment.getStatus())) {
            checklistService.validateAssignmentCanComplete(assignment);
        }
        return toDTO(assignmentDAO.save(assignment));
    }

    @Transactional(readOnly = true)
    public MaintenanceAssignmentDTO getById(Long id) {
        accessControlService.validatePermission("ASSIGNMENT_VIEW");
        MaintenanceAssignment assignment = getEntity(id);
        accessControlService.validateSiteAccess(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId());
        return toDTO(assignment);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceAssignmentDTO> getAll(Long siteId) {
        accessControlService.validatePermission("ASSIGNMENT_VIEW");
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        List<MaintenanceAssignment> assignments = siteId != null
                ? assignmentDAO.findBySiteId(siteId)
                : accessControlService.isAdmin() ? assignmentDAO.findAll() : assignmentDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        return assignments.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        accessControlService.validatePermission("ASSIGNMENT_DELETE");
        MaintenanceAssignment assignment = getEntity(id);
        accessControlService.validateSiteAccess(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId());
        assignmentDAO.deleteById(id);
    }

    public MaintenanceAssignment getEntity(Long id) {
        return assignmentDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance assignment not found with id: " + id));
    }

    private void apply(MaintenanceAssignment assignment, MaintenanceAssignmentDTO dto) {
        MaintenanceRequest request = requestService.getEntity(dto.getRequestId());
        requestService.validateWorkAllowed(request);
        Long requestSiteId = request.getSite() == null ? null : request.getSite().getId();
        if (dto.getSiteId() == null) {
            throw new InvalidOperationException("Site is required");
        }
        if (requestSiteId == null || !dto.getSiteId().equals(requestSiteId)) {
            throw new InvalidOperationException("Selected request does not belong to selected site");
        }
        assignment.setRequest(request);
        if (dto.getVendorId() == null) {
            throw new InvalidOperationException("Vendor is required");
        }
        Vendor vendor = vendorService.getEntity(dto.getVendorId());
        if (!vendorService.isVendorAssignedToSite(vendor.getId(), requestSiteId)) {
            throw new InvalidOperationException("Selected vendor is not assigned to the request site.");
        }
        assignment.setVendor(vendor);
        assignment.setAssignedTo(dto.getAssignedTo());
        assignment.setAssignedDate(dto.getAssignedDate());
        assignment.setPlannedStartDate(dto.getPlannedStartDate());
        assignment.setPlannedEndDate(dto.getPlannedEndDate());
        assignment.setActualStartDate(dto.getActualStartDate());
        assignment.setActualEndDate(dto.getActualEndDate());
        assignment.setStatus(dto.getStatus() == null ? "ASSIGNED" : dto.getStatus());
        assignment.setEstimatedCost(dto.getEstimatedCost());
        assignment.setActualCost(dto.getActualCost());
        assignment.setRemarks(dto.getRemarks());
    }

    private MaintenanceAssignmentDTO toDTO(MaintenanceAssignment assignment) {
        MaintenanceAssignmentDTO dto = new MaintenanceAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setSiteId(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId());
        dto.setSiteCode(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getSiteCode());
        dto.setSiteName(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getSiteName());
        dto.setRequestId(assignment.getRequest().getId());
        dto.setRequestNumber(assignment.getRequest().getRequestNumber());
        dto.setRequestTitle(assignment.getRequest().getTitle());
        dto.setVendorId(assignment.getVendor() == null ? null : assignment.getVendor().getId());
        dto.setVendorName(assignment.getVendor() == null ? null : assignment.getVendor().getVendorName());
        dto.setAssignedTo(assignment.getAssignedTo());
        dto.setAssignedDate(assignment.getAssignedDate());
        dto.setPlannedStartDate(assignment.getPlannedStartDate());
        dto.setPlannedEndDate(assignment.getPlannedEndDate());
        dto.setActualStartDate(assignment.getActualStartDate());
        dto.setActualEndDate(assignment.getActualEndDate());
        dto.setStatus(assignment.getStatus());
        dto.setEstimatedCost(assignment.getEstimatedCost());
        dto.setActualCost(assignment.getActualCost());
        dto.setRemarks(assignment.getRemarks());
        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setUpdatedAt(assignment.getUpdatedAt());
        return dto;
    }
}
