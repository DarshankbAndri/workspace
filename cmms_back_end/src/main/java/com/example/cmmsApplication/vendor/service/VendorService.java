package com.example.cmmsApplication.vendor.service;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.vendor.dao.VendorDAO;
import com.example.cmmsApplication.vendor.dto.VendorDTO;
import com.example.cmmsApplication.vendor.dto.VendorSiteAssignmentDTO;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendor.entity.VendorSiteAssignment;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class VendorService {
    private final VendorDAO vendorDAO;
    private final SiteService siteService;
    private final AccessControlService accessControlService;

public VendorDTO create(VendorDTO dto) {
        accessControlService.validatePermission("VENDOR_CREATE");
        accessControlService.validateAnySiteAccess(assignmentSiteIds(dto.getSiteAssignments()));
        if (vendorDAO.existsByVendorCode(dto.getVendorCode())) {
            throw new InvalidOperationException("Vendor code already exists: " + dto.getVendorCode());
        }
        Vendor vendor = new Vendor();
        apply(vendor, dto);
        replaceAssignments(vendor, dto.getSiteAssignments());
        return toDTO(vendorDAO.save(vendor));
    }

    public VendorDTO update(Long id, VendorDTO dto) {
        accessControlService.validatePermission("VENDOR_UPDATE");
        accessControlService.validateAnySiteAccess(assignmentSiteIds(dto.getSiteAssignments()));
        Vendor vendor = getEntity(id);
        if (vendorDAO.existsByVendorCodeAndIdNot(dto.getVendorCode(), id)) {
            throw new InvalidOperationException("Vendor code already exists: " + dto.getVendorCode());
        }
        apply(vendor, dto);
        vendor.getSiteAssignments().clear();
        replaceAssignments(vendor, dto.getSiteAssignments());
        return toDTO(vendorDAO.save(vendor));
    }

    @Transactional(readOnly = true)
    public VendorDTO getById(Long id) {
        accessControlService.validatePermission("VENDOR_VIEW");
        Vendor vendor = getEntityWithAssignments(id);
        accessControlService.validateAnySiteAccess(vendor.getSiteAssignments().stream()
                .filter((assignment) -> !"INACTIVE".equalsIgnoreCase(assignment.getStatus()))
                .map((assignment) -> assignment.getSite().getId())
                .collect(Collectors.toList()));
        return toDTO(vendor);
    }

    @Transactional(readOnly = true)
    public List<VendorDTO> getAll(Long siteId, Boolean active) {
        accessControlService.validatePermission("VENDOR_VIEW");
        List<Vendor> vendors;
        if (siteId != null && active != null) {
            accessControlService.validateSiteAccess(siteId);
            vendors = vendorDAO.findBySiteIdAndActive(siteId, active);
        } else if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
            vendors = vendorDAO.findBySiteId(siteId);
        } else if (active != null) {
            vendors = accessControlService.isAdmin() ? vendorDAO.findByActive(active) : vendorDAO.findBySiteIdsAndActive(accessControlService.getAllowedSiteIds(), active);
        } else {
            vendors = accessControlService.isAdmin() ? vendorDAO.findAll() : vendorDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        }
        return vendors.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        accessControlService.validatePermission("VENDOR_DELETE");
        getEntity(id);
        vendorDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Vendor getEntity(Long id) {
        return vendorDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Vendor getEntityWithAssignments(Long id) {
        return vendorDAO.findWithSiteAssignmentsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public boolean isVendorAssignedToSite(Long vendorId, Long siteId) {
        return vendorDAO.findBySiteId(siteId).stream().anyMatch((vendor) -> vendor.getId().equals(vendorId));
    }

    private void apply(Vendor vendor, VendorDTO dto) {
        vendor.setVendorCode(dto.getVendorCode());
        vendor.setVendorName(dto.getVendorName());
        vendor.setContactPerson(dto.getContactPerson());
        vendor.setEmail(dto.getEmail());
        vendor.setPhone(dto.getPhone());
        vendor.setAddress(dto.getAddress());
        vendor.setServiceCategory(dto.getServiceCategory());
        vendor.setActive(dto.getActive() == null || dto.getActive());
    }

    private void replaceAssignments(Vendor vendor, List<VendorSiteAssignmentDTO> assignments) {
        validateAssignments(assignments);
        for (VendorSiteAssignmentDTO dto : assignments) {
            Site site = siteService.getEntity(dto.getSiteId());
            if (!"ACTIVE".equalsIgnoreCase(site.getStatus())) {
                throw new InvalidOperationException("Selected site is inactive");
            }
            VendorSiteAssignment assignment = new VendorSiteAssignment();
            assignment.setVendor(vendor);
            assignment.setSite(site);
            assignment.setPrimarySite(Boolean.TRUE.equals(dto.getPrimarySite()));
            assignment.setStatus(isBlank(dto.getStatus()) ? "ACTIVE" : dto.getStatus());
            vendor.getSiteAssignments().add(assignment);
        }
    }

    private void validateAssignments(List<VendorSiteAssignmentDTO> assignments) {
        if (assignments == null || assignments.isEmpty()) {
            throw new InvalidOperationException("At least one site assignment is required");
        }
        int primaryCount = 0;
        Set<Long> activeSites = new HashSet<>();
        for (VendorSiteAssignmentDTO assignment : assignments) {
            if (assignment.getSiteId() == null) {
                throw new InvalidOperationException("Site is required for every assignment");
            }
            if (Boolean.TRUE.equals(assignment.getPrimarySite())) {
                primaryCount++;
            }
            String status = isBlank(assignment.getStatus()) ? "ACTIVE" : assignment.getStatus();
            if ("ACTIVE".equalsIgnoreCase(status) && !activeSites.add(assignment.getSiteId())) {
                throw new InvalidOperationException("Duplicate active site assignment is not allowed");
            }
        }
        if (primaryCount > 1) {
            throw new InvalidOperationException("Only one primary site is allowed per vendor");
        }
    }

    private VendorDTO toDTO(Vendor vendor) {
        VendorDTO dto = new VendorDTO();
        dto.setId(vendor.getId());
        dto.setVendorCode(vendor.getVendorCode());
        dto.setVendorName(vendor.getVendorName());
        dto.setContactPerson(vendor.getContactPerson());
        dto.setEmail(vendor.getEmail());
        dto.setPhone(vendor.getPhone());
        dto.setAddress(vendor.getAddress());
        dto.setServiceCategory(vendor.getServiceCategory());
        dto.setActive(vendor.getActive());
        dto.setCreatedAt(vendor.getCreatedAt());
        dto.setUpdatedAt(vendor.getUpdatedAt());
        List<VendorSiteAssignmentDTO> assignments = vendor.getSiteAssignments().stream()
                .map(this::toAssignmentDTO)
                .collect(Collectors.toList());
        dto.setSiteAssignments(assignments);
        List<VendorSiteAssignmentDTO> activeAssignments = assignments.stream()
                .filter((assignment) -> !"INACTIVE".equalsIgnoreCase(assignment.getStatus()))
                .collect(Collectors.toList());
        dto.setAssignedSiteCount(activeAssignments.size());
        dto.setPrimarySiteName(activeAssignments.stream()
                .filter((assignment) -> Boolean.TRUE.equals(assignment.getPrimarySite()))
                .map(VendorSiteAssignmentDTO::getSiteName)
                .findFirst()
                .orElse(null));
        dto.setSiteNames(activeAssignments.stream().map(VendorSiteAssignmentDTO::getSiteName).collect(Collectors.joining(", ")));
        return dto;
    }

    private VendorSiteAssignmentDTO toAssignmentDTO(VendorSiteAssignment assignment) {
        VendorSiteAssignmentDTO dto = new VendorSiteAssignmentDTO();
        dto.setAssignmentId(assignment.getId());
        dto.setSiteId(assignment.getSite().getId());
        dto.setSiteCode(assignment.getSite().getSiteCode());
        dto.setSiteName(assignment.getSite().getSiteName());
        dto.setPrimarySite(assignment.getPrimarySite());
        dto.setStatus(assignment.getStatus());
        return dto;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private List<Long> assignmentSiteIds(List<VendorSiteAssignmentDTO> assignments) {
        return assignments == null ? List.of() : assignments.stream().map(VendorSiteAssignmentDTO::getSiteId).collect(Collectors.toList());
    }
}
