package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.EmployeeDAO;
import com.example.cmmsApplication.dao.EmployeeSiteAssignmentDAO;
import com.example.cmmsApplication.dao.RoleDAO;
import com.example.cmmsApplication.dao.SiteDAO;
import com.example.cmmsApplication.dao.UserRoleAssignmentDAO;
import com.example.cmmsApplication.dto.EmployeeDTO;
import com.example.cmmsApplication.dto.EmployeeRoleAssignmentDTO;
import com.example.cmmsApplication.dto.EmployeeSiteAssignmentDTO;
import com.example.cmmsApplication.entity.Employee;
import com.example.cmmsApplication.entity.EmployeeSiteAssignment;
import com.example.cmmsApplication.entity.RoleMaster;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.entity.UserRoleAssignment;
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
    private final UserService userService;
    private final AccessControlService accessControlService;
    private final UserRoleAssignmentDAO userRoleAssignmentDAO;
    private final RoleDAO roleDAO;

    public EmployeeService(EmployeeDAO employeeDAO, SiteDAO siteDAO, EmployeeSiteAssignmentDAO assignmentDAO, UserService userService, AccessControlService accessControlService, UserRoleAssignmentDAO userRoleAssignmentDAO, RoleDAO roleDAO) {
        this.employeeDAO = employeeDAO;
        this.siteDAO = siteDAO;
        this.assignmentDAO = assignmentDAO;
        this.userService = userService;
        this.accessControlService = accessControlService;
        this.userRoleAssignmentDAO = userRoleAssignmentDAO;
        this.roleDAO = roleDAO;
    }

    public EmployeeDTO create(EmployeeDTO dto) {
        accessControlService.validatePermission("EMPLOYEE_CREATE");
        accessControlService.validateAnySiteAccess(assignmentSiteIds(dto.getSiteAssignments()));
        validateRequired(dto);
        if (employeeDAO.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new InvalidOperationException("Employee code already exists: " + dto.getEmployeeCode());
        }
        Employee employee = new Employee();
        apply(employee, dto);
        replaceAssignments(employee, dto.getSiteAssignments());
        Employee savedEmployee = employeeDAO.save(employee);
        User loginUser = userService.syncEmployeeLogin(savedEmployee, dto);
        syncRoleAssignments(savedEmployee, loginUser, dto);
        return toDTO(savedEmployee, true);
    }

    public EmployeeDTO update(Long id, EmployeeDTO dto) {
        accessControlService.validatePermission("EMPLOYEE_UPDATE");
        accessControlService.validateAnySiteAccess(assignmentSiteIds(dto.getSiteAssignments()));
        validateRequired(dto);
        Employee employee = getEntityWithAssignments(id);
        if (employeeDAO.existsByEmployeeCodeAndIdNot(dto.getEmployeeCode(), id)) {
            throw new InvalidOperationException("Employee code already exists: " + dto.getEmployeeCode());
        }
        apply(employee, dto);
        employee.getSiteAssignments().clear();
        replaceAssignments(employee, dto.getSiteAssignments());
        Employee savedEmployee = employeeDAO.save(employee);
        User loginUser = userService.syncEmployeeLogin(savedEmployee, dto);
        syncRoleAssignments(savedEmployee, loginUser, dto);
        return toDTO(savedEmployee, true);
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getById(Long id) {
        accessControlService.validatePermission("EMPLOYEE_VIEW");
        Employee employee = getEntityWithAssignments(id);
        accessControlService.validateAnySiteAccess(employee.getSiteAssignments().stream()
                .map((assignment) -> assignment.getSite().getId())
                .collect(Collectors.toList()));
        return toDTO(employee, true);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAll() {
        accessControlService.validatePermission("EMPLOYEE_VIEW");
        List<Long> allowedSiteIds = accessControlService.getAllowedSiteIds();
        return employeeDAO.findAll().stream()
                .filter((employee) -> accessControlService.isAdmin() || assignmentDAO.findByEmployeeId(employee.getId()).stream()
                        .anyMatch((assignment) -> assignment.getSite() != null && allowedSiteIds.contains(assignment.getSite().getId())))
                .map((employee) -> toDTO(employee, false))
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        accessControlService.validatePermission("EMPLOYEE_DELETE");
        Employee employee = getEntityWithAssignments(id);
        accessControlService.validateAnySiteAccess(employee.getSiteAssignments().stream()
                .map((assignment) -> assignment.getSite().getId())
                .collect(Collectors.toList()));
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
        validateRoleAssignments(dto);
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
        User loginUser = userService.getLoginUserByEmployeeId(employee.getId());
        if (loginUser != null) {
            dto.setLoginEnabled(true);
            dto.setUserId(loginUser.getId());
            dto.setUsername(loginUser.getUsername());
            dto.setAuthRole(loginUser.getRole());
            dto.setAccountStatus(Boolean.TRUE.equals(loginUser.getActive()) ? "ACTIVE" : "INACTIVE");
        } else {
            dto.setLoginEnabled(false);
            dto.setAccountStatus("ACTIVE");
        }

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
        if (loginUser != null) {
            dto.setRoleAssignments(userRoleAssignmentDAO.findByUserId(loginUser.getId()).stream()
                    .map(this::toRoleAssignmentDTO)
                    .collect(Collectors.toList()));
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

    private List<Long> assignmentSiteIds(List<EmployeeSiteAssignmentDTO> assignments) {
        return assignments == null ? List.of() : assignments.stream().map(EmployeeSiteAssignmentDTO::getSiteId).collect(Collectors.toList());
    }

    private void validateRoleAssignments(EmployeeDTO dto) {
        List<EmployeeRoleAssignmentDTO> roleAssignments = dto.getRoleAssignments();
        if (Boolean.TRUE.equals(dto.getLoginEnabled()) && (roleAssignments == null || roleAssignments.stream().noneMatch((assignment) -> !"INACTIVE".equalsIgnoreCase(assignment.getStatus())))) {
            throw new InvalidOperationException("At least one role assignment is required when login is enabled");
        }
        if (roleAssignments == null || roleAssignments.isEmpty()) {
            return;
        }
        Set<Long> assignedSiteIds = dto.getSiteAssignments().stream()
                .map(EmployeeSiteAssignmentDTO::getSiteId)
                .collect(Collectors.toSet());
        Set<String> activeRoleSites = new HashSet<>();
        for (EmployeeRoleAssignmentDTO assignment : roleAssignments) {
            if (assignment.getRoleId() == null) {
                throw new InvalidOperationException("Role is required for every role assignment");
            }
            RoleMaster role = roleDAO.findById(assignment.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + assignment.getRoleId()));
            if (!"ACTIVE".equalsIgnoreCase(role.getStatus())) {
                throw new InvalidOperationException("Selected role is inactive: " + role.getRoleCode());
            }
            if (assignment.getSiteId() != null && !assignedSiteIds.contains(assignment.getSiteId())) {
                throw new InvalidOperationException("Role assignment site must be one of the employee assigned sites");
            }
            String status = isBlank(assignment.getStatus()) ? "ACTIVE" : assignment.getStatus();
            if ("ACTIVE".equalsIgnoreCase(status)) {
                String key = assignment.getRoleId() + "|" + (assignment.getSiteId() == null ? "GLOBAL" : assignment.getSiteId());
                if (!activeRoleSites.add(key)) {
                    throw new InvalidOperationException("Duplicate active role assignment for same site is not allowed");
                }
            }
        }
    }

    private void syncRoleAssignments(Employee employee, User loginUser, EmployeeDTO dto) {
        User existingUser = loginUser == null ? userService.getLoginUserByEmployeeId(employee.getId()) : loginUser;
        if (existingUser == null) {
            return;
        }
        userRoleAssignmentDAO.deleteByUserId(existingUser.getId());
        if (!Boolean.TRUE.equals(dto.getLoginEnabled()) || dto.getRoleAssignments() == null) {
            return;
        }
        for (EmployeeRoleAssignmentDTO dtoAssignment : dto.getRoleAssignments()) {
            RoleMaster role = roleDAO.findById(dtoAssignment.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + dtoAssignment.getRoleId()));
            Site site = dtoAssignment.getSiteId() == null ? null : siteDAO.findById(dtoAssignment.getSiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + dtoAssignment.getSiteId()));
            UserRoleAssignment assignment = new UserRoleAssignment();
            assignment.setUser(existingUser);
            assignment.setRole(role);
            assignment.setSite(site);
            assignment.setStatus(isBlank(dtoAssignment.getStatus()) ? "ACTIVE" : dtoAssignment.getStatus());
            userRoleAssignmentDAO.save(assignment);
        }
    }

    private EmployeeRoleAssignmentDTO toRoleAssignmentDTO(UserRoleAssignment assignment) {
        EmployeeRoleAssignmentDTO dto = new EmployeeRoleAssignmentDTO();
        dto.setUserRoleId(assignment.getId());
        dto.setUserId(assignment.getUser().getId());
        dto.setRoleId(assignment.getRole().getId());
        dto.setRoleCode(assignment.getRole().getRoleCode());
        dto.setRoleName(assignment.getRole().getRoleName());
        dto.setSiteId(assignment.getSite() == null ? null : assignment.getSite().getId());
        dto.setSiteCode(assignment.getSite() == null ? null : assignment.getSite().getSiteCode());
        dto.setSiteName(assignment.getSite() == null ? null : assignment.getSite().getSiteName());
        dto.setStatus(assignment.getStatus());
        return dto;
    }
}
