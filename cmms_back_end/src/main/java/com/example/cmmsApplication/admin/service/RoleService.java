package com.example.cmmsApplication.admin.service;

import com.example.cmmsApplication.admin.dto.RoleDTO;
import com.example.cmmsApplication.admin.entity.RoleMaster;
import java.util.List;

/** Service contract for role. */
public interface RoleService {
    List<RoleDTO> getAll();

    RoleDTO getById(Long id);

    RoleDTO create(RoleDTO dto);

    RoleDTO update(Long id, RoleDTO dto);

    void delete(Long id);

    RoleMaster getEntity(Long id);
}
