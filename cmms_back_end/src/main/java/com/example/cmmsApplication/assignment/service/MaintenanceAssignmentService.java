package com.example.cmmsApplication.assignment.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.employee.dao.EmployeeDAO;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.employee.entity.EmployeeSiteAssignment;
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
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceAssignmentService {
    private static final Set<String> STATUSES = Set.of("ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED");

    private final MaintenanceAssignmentDAO assignmentDAO;
    private final MaintenanceRequestService requestService;
    private final VendorService vendorService;
    private final EmployeeDAO employeeDAO;
    private final AccessControlService accessControlService;
    private final MaintenanceAssignmentChecklistService checklistService;
    private final MaintenanceAssignmentWorkLogService workLogService;

    public MaintenanceAssignmentDTO create(MaintenanceAssignmentDTO dto) {
        accessControlService.validateSiteAccess(dto.getSiteId());
        MaintenanceAssignment assignment = new MaintenanceAssignment();
        apply(assignment, dto);
        if ("COMPLETED".equalsIgnoreCase(assignment.getStatus())) {
            throw new InvalidOperationException("Create the assignment before completing it with work logs and checklist evidence");
        }
        syncRequestStatusFromAssignment(assignment);
        return toDTO(assignmentDAO.save(assignment));
    }

    public MaintenanceAssignmentDTO update(Long id, MaintenanceAssignmentDTO dto) {
        MaintenanceAssignment assignment = getEntity(id);
        Long currentSiteId = assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId();
        accessControlService.validateSiteAccess(currentSiteId);
        accessControlService.validateSiteAccess(dto.getSiteId());
        apply(assignment, dto);
        if ("COMPLETED".equalsIgnoreCase(assignment.getStatus())) {
            checklistService.validateAssignmentCanComplete(assignment);
            workLogService.validateAssignmentCanComplete(assignment);
        }
        syncRequestStatusFromAssignment(assignment);
        return toDTO(assignmentDAO.save(assignment));
    }

    @Transactional(readOnly = true)
    public MaintenanceAssignmentDTO getById(Long id) {
        MaintenanceAssignment assignment = getEntity(id);
        accessControlService.validateSiteAccess(assignment.getRequest().getSite() == null ? null : assignment.getRequest().getSite().getId());
        return toDTO(assignment);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceAssignmentDTO> getAll(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        List<MaintenanceAssignment> assignments = siteId != null
                ? assignmentDAO.findBySiteId(siteId)
                : accessControlService.isAdmin() ? assignmentDAO.findAll() : assignmentDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        return assignments.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
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
        Employee assignedEmployee = dto.getAssignedEmployeeId() == null ? null : validateAssignedEmployee(dto.getAssignedEmployeeId(), requestSiteId);
        assignment.setAssignedEmployee(assignedEmployee);
        String assignedTo = assignedEmployee == null ? dto.getAssignedTo() : employeeName(assignedEmployee);
        if (assignedTo == null || assignedTo.isBlank()) {
            throw new InvalidOperationException("Assigned technician is required");
        }
        assignment.setAssignedTo(assignedTo.trim());
        assignment.setAssignedDate(dto.getAssignedDate());
        assignment.setPlannedStartDate(dto.getPlannedStartDate());
        assignment.setPlannedEndDate(dto.getPlannedEndDate());
        assignment.setActualStartDate(dto.getActualStartDate());
        assignment.setActualEndDate(dto.getActualEndDate());
        assignment.setStatus(normalizeStatus(dto.getStatus()));
        validateDateRange(assignment);
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
        dto.setEquipmentId(assignment.getRequest().getEquipment() == null ? null : assignment.getRequest().getEquipment().getId());
        dto.setEquipmentCode(assignment.getRequest().getEquipment() == null ? null : assignment.getRequest().getEquipment().getEquipmentCode());
        dto.setEquipmentName(assignment.getRequest().getEquipment() == null ? null : assignment.getRequest().getEquipment().getEquipmentName());
        dto.setVendorId(assignment.getVendor() == null ? null : assignment.getVendor().getId());
        dto.setVendorName(assignment.getVendor() == null ? null : assignment.getVendor().getVendorName());
        dto.setAssignedEmployeeId(assignment.getAssignedEmployee() == null ? null : assignment.getAssignedEmployee().getId());
        dto.setAssignedEmployeeCode(assignment.getAssignedEmployee() == null ? null : assignment.getAssignedEmployee().getEmployeeCode());
        dto.setAssignedEmployeeName(employeeName(assignment.getAssignedEmployee()));
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

    private Employee validateAssignedEmployee(Long employeeId, Long siteId) {
        Employee employee = employeeDAO.findWithSiteAssignmentsById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new InvalidOperationException("Selected assigned technician is inactive");
        }
        boolean assignedToSite = employee.getSiteAssignments().stream()
                .anyMatch((assignment) -> isActiveSiteAssignment(assignment, siteId));
        if (!assignedToSite) {
            throw new InvalidOperationException("Selected assigned technician is not assigned to the request site");
        }
        return employee;
    }

    private boolean isActiveSiteAssignment(EmployeeSiteAssignment assignment, Long siteId) {
        return assignment.getSite() != null
                && siteId != null
                && siteId.equals(assignment.getSite().getId())
                && !"INACTIVE".equalsIgnoreCase(assignment.getStatus());
    }

    private String normalizeStatus(String value) {
        String status = value == null || value.isBlank() ? "ASSIGNED" : value.trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(status)) {
            throw new InvalidOperationException("Assignment status must be ASSIGNED, IN_PROGRESS, COMPLETED, or CANCELLED");
        }
        return status;
    }

    private void validateDateRange(MaintenanceAssignment assignment) {
        if (assignment.getPlannedStartDate() != null
                && assignment.getPlannedEndDate() != null
                && assignment.getPlannedEndDate().isBefore(assignment.getPlannedStartDate())) {
            throw new InvalidOperationException("Planned end date cannot be before planned start date");
        }
        if (assignment.getActualStartDate() != null
                && assignment.getActualEndDate() != null
                && assignment.getActualEndDate().isBefore(assignment.getActualStartDate())) {
            throw new InvalidOperationException("Actual end date cannot be before actual start date");
        }
        if ("COMPLETED".equalsIgnoreCase(assignment.getStatus())
                && (assignment.getActualStartDate() == null || assignment.getActualEndDate() == null)) {
            throw new InvalidOperationException("Actual start and end dates are required before completing the assignment");
        }
    }

    private String employeeName(Employee employee) {
        if (employee == null) {
            return null;
        }
        return (employee.getFirstName() + " " + (employee.getLastName() == null ? "" : employee.getLastName())).trim();
    }

    private void syncRequestStatusFromAssignment(MaintenanceAssignment assignment) {
        MaintenanceRequest request = assignment.getRequest();
        if (request == null || request.getStatus() == null) {
            return;
        }
        String requestStatus = request.getStatus().toUpperCase(Locale.ROOT);
        if ("ASSIGNED".equalsIgnoreCase(assignment.getStatus()) && "OPEN".equals(requestStatus)) {
            request.setStatus("ASSIGNED");
        }
        if ("IN_PROGRESS".equalsIgnoreCase(assignment.getStatus())
                && Set.of("OPEN", "ASSIGNED", "ON_HOLD").contains(requestStatus)) {
            request.setStatus("IN_PROGRESS");
        }
    }
}
