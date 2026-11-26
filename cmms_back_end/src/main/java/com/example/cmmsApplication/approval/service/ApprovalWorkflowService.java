package com.example.cmmsApplication.approval.service;

import com.example.cmmsApplication.approval.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.approval.entity.ApprovalRequest;
import com.example.cmmsApplication.site.entity.Site;
import java.util.List;

/** Service contract for approval workflow. */
public interface ApprovalWorkflowService {
    String PM_SCHEDULE = "PM_SCHEDULE";

    String PM_WORK_ORDER = "PM_WORK_ORDER";

    String MAINTENANCE_REQUEST = "MAINTENANCE_REQUEST";

    String SPARE_ISSUE = "SPARE_ISSUE";

    String CREATE = "CREATE";

    String UPDATE = "UPDATE";

    String GENERATE = "GENERATE";

    String CLOSE = "CLOSE";

    String RESERVE = "RESERVE";

    String ISSUE = "ISSUE";

    void ensureDefaultApprovalConfigs();

    boolean isApprovalEnabled(String moduleCode, String actionCode);

    ApprovalRequestDTO createApprovalRequest(String moduleCode,
            String actionCode,
            Long referenceId,
            String referenceCode,
            Site site,
            Object payload,
            String remarks);

    ApprovalRequestDTO approve(Long approvalRequestId, String comments);

    ApprovalRequestDTO reject(Long approvalRequestId, String comments);

    List<ApprovalRequestDTO> getPendingApprovalsForCurrentUser();

    List<ApprovalRequestDTO> getApprovalHistory(String moduleCode, Long referenceId);

    PageProperties searchApprovalHistory(SearchDTO searchDTO);

    PageProperties searchPendingApprovals(SearchDTO searchDTO);

    ApprovalRequestDTO getApprovalRequest(Long approvalRequestId);

    void validateApproverPermission(ApprovalRequest request, String permissionCode);
}
