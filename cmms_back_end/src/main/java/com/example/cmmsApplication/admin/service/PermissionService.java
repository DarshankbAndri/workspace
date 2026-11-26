package com.example.cmmsApplication.admin.service;

import com.example.cmmsApplication.admin.dto.PermissionDTO;
import java.util.List;
import java.util.Map;

/** Service contract for permission. */
public interface PermissionService {
    List<PermissionDTO> getAll();

    Map<String, List<PermissionDTO>> getGrouped();
}
