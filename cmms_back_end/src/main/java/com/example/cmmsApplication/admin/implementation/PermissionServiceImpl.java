package com.example.cmmsApplication.admin.implementation;

import com.example.cmmsApplication.admin.service.PermissionService;

import com.example.cmmsApplication.admin.dao.PermissionDAO;
import com.example.cmmsApplication.admin.dto.PermissionDTO;
import com.example.cmmsApplication.admin.entity.PermissionMaster;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service("permissionService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionServiceImpl implements PermissionService {
    private final PermissionDAO permissionDAO;

    @Override
    public List<PermissionDTO> getAll() {
        return permissionDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public Map<String, List<PermissionDTO>> getGrouped() {
        return permissionDAO.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.groupingBy((permission) -> permission.getModuleName() == null ? "General" : permission.getModuleName()));
    }

    private PermissionDTO toDTO(PermissionMaster permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setPermissionCode(permission.getPermissionCode());
        dto.setPermissionName(permission.getPermissionName());
        dto.setModuleName(permission.getModuleName());
        dto.setActionName(permission.getActionName());
        dto.setStatus(permission.getStatus());
        dto.setCreatedAt(permission.getCreatedAt());
        dto.setUpdatedAt(permission.getUpdatedAt());
        return dto;
    }
}
