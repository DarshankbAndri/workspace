package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.dto.MaintenanceAssignmentDTO;
import com.example.cmmsApplication.entity.MaintenanceAssignment;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.entity.Vendor;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceAssignmentService {
    private final MaintenanceAssignmentDAO assignmentDAO;
    private final MaintenanceRequestService requestService;
    private final VendorService vendorService;

    public MaintenanceAssignmentService(MaintenanceAssignmentDAO assignmentDAO, MaintenanceRequestService requestService, VendorService vendorService) {
        this.assignmentDAO = assignmentDAO;
        this.requestService = requestService;
        this.vendorService = vendorService;
    }

    public MaintenanceAssignmentDTO create(MaintenanceAssignmentDTO dto) {
        MaintenanceAssignment assignment = new MaintenanceAssignment();
        apply(assignment, dto);
        return toDTO(assignmentDAO.save(assignment));
    }

    public MaintenanceAssignmentDTO update(Long id, MaintenanceAssignmentDTO dto) {
        MaintenanceAssignment assignment = getEntity(id);
        apply(assignment, dto);
        return toDTO(assignmentDAO.save(assignment));
    }

    @Transactional(readOnly = true)
    public MaintenanceAssignmentDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceAssignmentDTO> getAll() {
        return assignmentDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        getEntity(id);
        assignmentDAO.deleteById(id);
    }

    private MaintenanceAssignment getEntity(Long id) {
        return assignmentDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance assignment not found with id: " + id));
    }

    private void apply(MaintenanceAssignment assignment, MaintenanceAssignmentDTO dto) {
        MaintenanceRequest request = requestService.getEntity(dto.getRequestId());
        assignment.setRequest(request);
        Vendor vendor = dto.getVendorId() == null ? null : vendorService.getEntity(dto.getVendorId());
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
