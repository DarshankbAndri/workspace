package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.ApprovalDecisionDTO;
import com.example.cmmsApplication.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.service.ApprovalWorkflowService;
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
    public ResponseEntity<List<ApprovalRequestDTO>> getPending() {
        return ResponseEntity.ok(approvalWorkflowService.getPendingApprovalsForCurrentUser());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ApprovalRequestDTO>> getHistory(@RequestParam String moduleCode,
                                                               @RequestParam Long referenceId) {
        return ResponseEntity.ok(approvalWorkflowService.getApprovalHistory(moduleCode, referenceId));
    }

    @PostMapping("/history/search")
    public ResponseEntity<PageProperties> searchHistory(@RequestBody(required = false) SearchDTO searchDTO) {
        return ResponseEntity.ok(approvalWorkflowService.searchApprovalHistory(searchDTO));
    }

    @GetMapping("/{approvalRequestId}")
    public ResponseEntity<ApprovalRequestDTO> getById(@PathVariable Long approvalRequestId) {
        return ResponseEntity.ok(approvalWorkflowService.getApprovalRequest(approvalRequestId));
    }

    @PostMapping("/{approvalRequestId}/approve")
    public ResponseEntity<ApprovalRequestDTO> approve(@PathVariable Long approvalRequestId,
                                                      @RequestBody(required = false) ApprovalDecisionDTO dto) {
        return ResponseEntity.ok(approvalWorkflowService.approve(approvalRequestId, dto == null ? null : dto.getComments()));
    }

    @PostMapping("/{approvalRequestId}/reject")
    public ResponseEntity<ApprovalRequestDTO> reject(@PathVariable Long approvalRequestId,
                                                     @RequestBody(required = false) ApprovalDecisionDTO dto) {
        return ResponseEntity.ok(approvalWorkflowService.reject(approvalRequestId, dto == null ? null : dto.getComments()));
    }
}
