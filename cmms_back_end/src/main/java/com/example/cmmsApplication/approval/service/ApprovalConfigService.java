package com.example.cmmsApplication.approval.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.approval.dao.ApprovalConfigDAO;
import com.example.cmmsApplication.approval.dto.ApprovalConfigDTO;
import com.example.cmmsApplication.approval.entity.ApprovalConfig;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalConfigService {
    private final ApprovalConfigDAO approvalConfigDAO;
    private final AccessControlService accessControlService;

    @Transactional(readOnly = true)
    public List<ApprovalConfigDTO> getAll() {
        accessControlService.validatePermission("APPROVAL_CONFIG_VIEW");
        return approvalConfigDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ApprovalConfigDTO create(ApprovalConfigDTO dto) {
        accessControlService.validatePermission("APPROVAL_CONFIG_UPDATE");
        validate(dto);
        String moduleCode = normalize(dto.getModuleCode());
        String actionCode = normalize(dto.getActionCode());
        if (approvalConfigDAO.existsByModuleCodeAndActionCode(moduleCode, actionCode)) {
            throw new InvalidOperationException("Approval config already exists for " + moduleCode + " / " + actionCode);
        }
        ApprovalConfig config = new ApprovalConfig();
        apply(config, dto);
        return toDTO(approvalConfigDAO.save(config));
    }

    public ApprovalConfigDTO update(Long id, ApprovalConfigDTO dto) {
        accessControlService.validatePermission("APPROVAL_CONFIG_UPDATE");
        validate(dto);
        ApprovalConfig config = approvalConfigDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval config not found with id: " + id));
        String moduleCode = normalize(dto.getModuleCode());
        String actionCode = normalize(dto.getActionCode());
        if (approvalConfigDAO.existsByModuleCodeAndActionCodeAndIdNot(moduleCode, actionCode, id)) {
            throw new InvalidOperationException("Approval config already exists for " + moduleCode + " / " + actionCode);
        }
        apply(config, dto);
        return toDTO(approvalConfigDAO.save(config));
    }

    private void apply(ApprovalConfig config, ApprovalConfigDTO dto) {
        config.setModuleCode(normalize(dto.getModuleCode()));
        config.setActionCode(normalize(dto.getActionCode()));
        config.setApprovalRequired(dto.getApprovalRequired() != null && dto.getApprovalRequired());
        config.setApproverRoleCode(dto.getApproverRoleCode() == null || dto.getApproverRoleCode().isBlank()
                ? null
                : normalize(dto.getApproverRoleCode()));
        config.setMinApprovalCount(dto.getMinApprovalCount() == null || dto.getMinApprovalCount() < 1 ? 1 : dto.getMinApprovalCount());
        config.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "ACTIVE" : normalize(dto.getStatus()));
    }

    private void validate(ApprovalConfigDTO dto) {
        if (dto.getModuleCode() == null || dto.getModuleCode().isBlank()) {
            throw new InvalidOperationException("Module code is required");
        }
        if (dto.getActionCode() == null || dto.getActionCode().isBlank()) {
            throw new InvalidOperationException("Action code is required");
        }
    }

    private ApprovalConfigDTO toDTO(ApprovalConfig config) {
        ApprovalConfigDTO dto = new ApprovalConfigDTO();
        dto.setId(config.getId());
        dto.setModuleCode(config.getModuleCode());
        dto.setActionCode(config.getActionCode());
        dto.setApprovalRequired(config.getApprovalRequired());
        dto.setApproverRoleCode(config.getApproverRoleCode());
        dto.setMinApprovalCount(config.getMinApprovalCount());
        dto.setStatus(config.getStatus());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());
        return dto;
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toUpperCase(Locale.ROOT);
    }
}
