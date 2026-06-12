package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.EmployeeDAO;
import com.example.cmmsApplication.dao.EmployeeSiteAssignmentDAO;
import com.example.cmmsApplication.dao.SiteDAO;
import com.example.cmmsApplication.dto.EmployeeDTO;
import com.example.cmmsApplication.dto.EmployeeSiteAssignmentDTO;
import com.example.cmmsApplication.entity.Employee;
import com.example.cmmsApplication.entity.EmployeeSiteAssignment;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {
    private final EmployeeDAO employeeDAO;
    private final SiteDAO siteDAO;
    private final EmployeeSiteAssignmentDAO assignmentDAO;

    public EmployeeService(EmployeeDAO employeeDAO, SiteDAO siteDAO, EmployeeSiteAssignmentDAO assignmentDAO) {
        this.employeeDAO = employeeDAO;
        this.siteDAO = siteDAO;
        this.assignmentDAO = assignmentDAO;
    }

    public EmployeeDTO create(EmployeeDTO dto) {
        validateRequired(dto);
        if (employeeDAO.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new InvalidOperationException("Employee code already exists: " + dto.getEmployeeCode());
        }
        Employee employee = new Employee();
        apply(employee, dto);
        replaceAssignments(employee, dto.getSiteAssignments());
        return toDTO(employeeDAO.save(employee), true);
    }

    public EmployeeDTO update(Long id, EmployeeDTO dto) {
        validateRequired(dto);
        Employee employee = getEntityWithAssignments(id);
        if (employeeDAO.existsByEmployeeCodeAndIdNot(dto.getEmployeeCode(), id)) {
            throw new InvalidOperationException("Employee code already exists: " + dto.getEmployeeCode());
        }
        apply(employee, dto);
        employee.getSiteAssignments().clear();
        replaceAssignments(employee, dto.getSiteAssignments());
        return toDTO(employeeDAO.save(employee), true);
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getById(Long id) {
        return toDTO(getEntityWithAssignments(id), true);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAll() {
        return employeeDAO.findAll().stream().map((employee) -> toDTO(employee, false)).collect(Collectors.toList());
    }

    public void delete(Long id) {
        Employee employee = getEntityWithAssignments(id);
        employee.setStatus("INACTIVE");
        employee.getSiteAssignments().forEach((assignment) -> assignment.setStatus("INACTIVE"));
        employeeDAO.save(employee);
    }

    private Employee getEntityWithAssignments(Long id) {
        return employeeDAO.findWithSiteAssignmentsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    private void validateRequired(EmployeeDTO dto) {
        if (isBlank(dto.getEmployeeCode())) {
            throw new InvalidOperationException("Employee code is required");
        }
        if (isBlank(dto.getMobileNumber())) {
            throw new InvalidOperationException("Mobile number is required");
        }
        if (dto.getSiteAssignments() == null || dto.getSiteAssignments().isEmpty()) {
            throw new InvalidOperationException("At least one site assignment is required");
        }

        int primaryCount = 0;
        Set<String> activeSiteRoles = new HashSet<>();
        for (EmployeeSiteAssignmentDTO assignment : dto.getSiteAssignments()) {
            if (assignment.getSiteId() == null) {
                throw new InvalidOperationException("Site is required for every assignment");
            }
            if (isBlank(assignment.getRoleName())) {
                throw new InvalidOperationException("Role is required for every assignment");
            }
            if (Boolean.TRUE.equals(assignment.getPrimarySite())) {
                primaryCount++;
            }
            validateDateRange(assignment.getEffectiveFrom(), assignment.getEffectiveTo());
            String status = isBlank(assignment.getStatus()) ? "ACTIVE" : assignment.getStatus();
            if ("ACTIVE".equalsIgnoreCase(status)) {
                String key = assignment.getSiteId() + "|" + assignment.getRoleName().trim().toLowerCase();
                if (!activeSiteRoles.add(key)) {
                    throw new InvalidOperationException("Duplicate active assignment for same site and role is not allowed");
                }
            }
        }
        if (primaryCount > 1) {
            throw new InvalidOperationException("Only one primary site is allowed per employee");
        }
    }

    private void validateDateRange(LocalDate effectiveFrom, LocalDate effectiveTo) {
        if (effectiveFrom != null && effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new InvalidOperationException("Effective to date should not be before effective from date");
        }
    }

    private void apply(Employee employee, EmployeeDTO dto) {
        employee.setEmployeeCode(dto.getEmployeeCode());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setMobileNumber(dto.getMobileNumber());
        employee.setEmail(dto.getEmail());
        employee.setGender(dto.getGender());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setDateOfJoining(dto.getDateOfJoining());
        employee.setDesignation(dto.getDesignation());
        employee.setDepartment(dto.getDepartment());
        employee.setStatus(isBlank(dto.getStatus()) ? "ACTIVE" : dto.getStatus());
    }

    private void replaceAssignments(Employee employee, List<EmployeeSiteAssignmentDTO> assignments) {
        for (EmployeeSiteAssignmentDTO dto : assignments) {
            Site site = siteDAO.findById(dto.getSiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + dto.getSiteId()));
            EmployeeSiteAssignment assignment = new EmployeeSiteAssignment();
            assignment.setEmployee(employee);
            assignment.setSite(site);
            assignment.setRoleName(dto.getRoleName());
            assignment.setPrimarySite(Boolean.TRUE.equals(dto.getPrimarySite()));
            assignment.setEffectiveFrom(dto.getEffectiveFrom());
            assignment.setEffectiveTo(dto.getEffectiveTo());
            assignment.setStatus(isBlank(dto.getStatus()) ? "ACTIVE" : dto.getStatus());
            employee.getSiteAssignments().add(assignment);
        }
    }

    private EmployeeDTO toDTO(Employee employee, boolean includeAssignments) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setMobileNumber(employee.getMobileNumber());
        dto.setEmail(employee.getEmail());
        dto.setGender(employee.getGender());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setDateOfJoining(employee.getDateOfJoining());
        dto.setDesignation(employee.getDesignation());
        dto.setDepartment(employee.getDepartment());
        dto.setStatus(employee.getStatus());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setUpdatedAt(employee.getUpdatedAt());

        List<EmployeeSiteAssignment> assignments = includeAssignments
                ? employee.getSiteAssignments()
                : assignmentDAO.findByEmployeeId(employee.getId());
        dto.setAssignedSiteCount((int) assignments.stream()
                .filter((assignment) -> "ACTIVE".equalsIgnoreCase(assignment.getStatus()))
                .map((assignment) -> assignment.getSite().getId())
                .distinct()
                .count());
        if (includeAssignments) {
            dto.setSiteAssignments(assignments.stream().map(this::toAssignmentDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    private EmployeeSiteAssignmentDTO toAssignmentDTO(EmployeeSiteAssignment assignment) {
        EmployeeSiteAssignmentDTO dto = new EmployeeSiteAssignmentDTO();
        dto.setAssignmentId(assignment.getId());
        dto.setSiteId(assignment.getSite().getId());
        dto.setSiteName(assignment.getSite().getSiteName());
        dto.setRoleName(assignment.getRoleName());
        dto.setPrimarySite(assignment.getPrimarySite());
        dto.setEffectiveFrom(assignment.getEffectiveFrom());
        dto.setEffectiveTo(assignment.getEffectiveTo());
        dto.setStatus(assignment.getStatus());
        return dto;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
