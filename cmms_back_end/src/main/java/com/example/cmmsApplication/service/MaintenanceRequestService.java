package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dto.MaintenanceRequestDTO;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.entity.MaintenanceRequest;
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

    public MaintenanceRequestService(MaintenanceRequestDAO requestDAO, EquipmentService equipmentService) {
        this.requestDAO = requestDAO;
        this.equipmentService = equipmentService;
    }

    public MaintenanceRequestDTO create(MaintenanceRequestDTO dto) {
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
        MaintenanceRequest request = getEntity(id);
        apply(request, dto);
        if (requestDAO.existsByRequestNumberAndIdNot(request.getRequestNumber(), id)) {
            throw new InvalidOperationException("Request number already exists: " + request.getRequestNumber());
        }
        return toDTO(requestDAO.save(request));
    }

    @Transactional(readOnly = true)
    public MaintenanceRequestDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRequestDTO> getAll() {
        return requestDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        getEntity(id);
        requestDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public MaintenanceRequest getEntity(Long id) {
        return requestDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private void apply(MaintenanceRequest request, MaintenanceRequestDTO dto) {
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
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
