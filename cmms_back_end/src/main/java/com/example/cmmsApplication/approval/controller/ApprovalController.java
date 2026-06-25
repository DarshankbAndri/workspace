package com.example.cmmsApplication.approval.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.approval.dto.ApprovalDecisionDTO;
import com.example.cmmsApplication.approval.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.approval.service.ApprovalWorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approvals")
public class ApprovalController {
    private final ApprovalWorkflowService approvalWorkflowService;

    public ApprovalController(ApprovalWorkflowService approvalWorkflowService) {
        this.approvalWorkflowService = approvalWorkflowService;
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<?>> getPending() {
        return ResponseFactory.ok(approvalWorkflowService.getPendingApprovalsForCurrentUser());
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<?>> getHistory(@RequestParam String moduleCode,
                                                               @RequestParam Long referenceId) {
        return ResponseFactory.ok(approvalWorkflowService.getApprovalHistory(moduleCode, referenceId));
    }

    @PostMapping("/history/search")
    public ResponseEntity<ApiResponse<?>> searchHistory(@RequestBody(required = false) SearchDTO searchDTO) {
        return ResponseFactory.ok(approvalWorkflowService.searchApprovalHistory(searchDTO));
    }

    @GetMapping("/{approvalRequestId}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long approvalRequestId) {
        return ResponseFactory.ok(approvalWorkflowService.getApprovalRequest(approvalRequestId));
    }

    @PostMapping("/{approvalRequestId}/approve")
    public ResponseEntity<ApiResponse<?>> approve(@PathVariable Long approvalRequestId,
                                                      @RequestBody(required = false) ApprovalDecisionDTO dto) {
        return ResponseFactory.ok(approvalWorkflowService.approve(approvalRequestId, dto == null ? null : dto.getComments()));
    }

    @PostMapping("/{approvalRequestId}/reject")
    public ResponseEntity<ApiResponse<?>> reject(@PathVariable Long approvalRequestId,
                                                     @RequestBody(required = false) ApprovalDecisionDTO dto) {
        return ResponseFactory.ok(approvalWorkflowService.reject(approvalRequestId, dto == null ? null : dto.getComments()));
    }
}




