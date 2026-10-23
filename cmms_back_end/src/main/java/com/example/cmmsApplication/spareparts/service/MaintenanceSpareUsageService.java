package com.example.cmmsApplication.spareparts.service;

import com.example.cmmsApplication.spareparts.dto.MaintenanceSpareUsageDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartReorderDTO;
import java.math.BigDecimal;
import java.util.List;

/** Service contract for maintenance spare usage. */
public interface MaintenanceSpareUsageService {
    List<MaintenanceSpareUsageDTO> getAll(String status);

    MaintenanceSpareUsageDTO getById(Long id);

    List<MaintenanceSpareUsageDTO> getByAssignment(Long assignmentId);

    MaintenanceSpareUsageDTO create(Long assignmentId, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO update(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    void delete(Long assignmentId, Long usageId);

    MaintenanceSpareUsageDTO managerApprove(Long id, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO managerReject(Long id, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO checkStock(Long id, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO reserve(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO reserveById(Long id, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO issue(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO issueById(Long id, MaintenanceSpareUsageDTO dto);

    SparePartReorderDTO createPurchaseRequest(Long id, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO markPurchaseReceived(Long id);

    MaintenanceSpareUsageDTO consume(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO consumeReturnById(Long id, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO reject(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO cancel(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    MaintenanceSpareUsageDTO returnIssued(Long assignmentId, Long usageId, MaintenanceSpareUsageDTO dto);

    void completeApprovedTransition(Long usageId, String actionCode);

    void completeRejectedTransition(Long usageId, String actionCode);

    BigDecimal getMaterialCost(Long assignmentId);
}
