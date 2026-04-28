package com.example.travelreimbursement.controller;

import com.example.travelreimbursement.dto.ApprovalRequestDTO;
import com.example.travelreimbursement.dto.ClaimDTO;
import com.example.travelreimbursement.service.ClaimService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/claims")
@Validated
@Tag(name = "Claims", description = "Travel claim management endpoints")
public class ClaimController {
    
    private final ClaimService claimService;
    
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }
    
    @PostMapping
    @Operation(summary = "Create new claim", description = "Create a new travel reimbursement claim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Claim created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid claim data")
    })
    public ResponseEntity<ClaimDTO> createClaim(
            @Parameter(description = "User ID", required = true)
            @RequestParam Long userId,
            @Parameter(description = "Claim details", required = true)
            @Valid @RequestBody ClaimDTO claimDTO) {
        ClaimDTO createdClaim = claimService.createClaim(userId, claimDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClaim);
    }
    
    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit claim", description = "Submit a draft claim for manager approval")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid claim state"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDTO> submitClaim(
            @Parameter(description = "Claim ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "User ID", required = true)
            @RequestParam Long userId) {
        ClaimDTO submittedClaim = claimService.submitClaim(id, userId);
        return ResponseEntity.ok(submittedClaim);
    }
    
    @GetMapping("/my")
    @Operation(summary = "Get user's claims", description = "Retrieve all claims submitted by a specific user")
    @ApiResponse(responseCode = "200", description = "Claims retrieved successfully")
    public ResponseEntity<List<ClaimDTO>> getMyClaimsClimate(
            @Parameter(description = "User ID", required = true)
            @RequestParam Long userId) {
        List<ClaimDTO> claims = claimService.getClaimsByUser(userId);
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/pending")
    @Operation(summary = "Get pending claims", description = "Retrieve all pending claims for a manager")
    @ApiResponse(responseCode = "200", description = "Pending claims retrieved successfully")
    public ResponseEntity<List<ClaimDTO>> getPendingClaims(
            @Parameter(description = "Manager ID", required = true)
            @RequestParam Long managerId) {
        List<ClaimDTO> claims = claimService.getPendingClaimsByManager(managerId);
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get claim details", description = "Retrieve detailed information about a specific claim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim found and returned"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDTO> getClaimById(
            @Parameter(description = "Claim ID", required = true)
            @PathVariable Long id) {
        ClaimDTO claim = claimService.getClaimById(id);
        return ResponseEntity.ok(claim);
    }
    
    @PutMapping("/{id}/approve")
    @Operation(summary = "Manager approve claim", description = "Manager approves a submitted claim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim approved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid claim state"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDTO> approveClaim(
            @Parameter(description = "Claim ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Manager ID", required = true)
            @RequestParam Long managerId,
            @Parameter(description = "Approval comments", required = true)
            @Valid @RequestBody ApprovalRequestDTO approvalRequest) {
        ClaimDTO approvedClaim = claimService.approveClaim(id, managerId, approvalRequest.getComments());
        return ResponseEntity.ok(approvedClaim);
    }
    
    @PutMapping("/{id}/reject")
    @Operation(summary = "Manager reject claim", description = "Manager rejects a submitted claim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim rejected successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid claim state"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDTO> rejectClaim(
            @Parameter(description = "Claim ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Manager ID", required = true)
            @RequestParam Long managerId,
            @Parameter(description = "Rejection reason", required = true)
            @Valid @RequestBody ApprovalRequestDTO approvalRequest) {
        ClaimDTO rejectedClaim = claimService.rejectClaim(id, managerId, approvalRequest.getComments());
        return ResponseEntity.ok(rejectedClaim);
    }
    
    @PutMapping("/{id}/hr-approve")
    @Operation(summary = "HR approve claim", description = "HR approves a manager-approved claim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim approved by HR successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid claim state"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDTO> approveByHR(
            @Parameter(description = "Claim ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "HR ID", required = true)
            @RequestParam Long hrId,
            @Parameter(description = "Approval comments", required = true)
            @Valid @RequestBody ApprovalRequestDTO approvalRequest) {
        ClaimDTO approvedClaim = claimService.approveBHR(id, hrId, approvalRequest.getComments());
        return ResponseEntity.ok(approvedClaim);
    }
    
    @PutMapping("/{id}/pay")
    @Operation(summary = "Mark claim as paid", description = "HR marks a claim as paid to employee")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim marked as paid successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid claim state"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDTO> markAsPaid(
            @Parameter(description = "Claim ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "HR ID", required = true)
            @RequestParam Long hrId) {
        ClaimDTO paidClaim = claimService.markAsPaid(id, hrId);
        return ResponseEntity.ok(paidClaim);
    }
}
