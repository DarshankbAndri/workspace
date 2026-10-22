package com.example.cmmsApplication.approval.service;

import com.example.cmmsApplication.approval.dto.ApprovalConfigDTO;
import java.util.List;

/** Service contract for approval config. */
public interface ApprovalConfigService {
    List<ApprovalConfigDTO> getAll();

    ApprovalConfigDTO create(ApprovalConfigDTO dto);

    ApprovalConfigDTO update(Long id, ApprovalConfigDTO dto);
}
