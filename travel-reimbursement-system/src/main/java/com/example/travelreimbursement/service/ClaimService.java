package com.example.travelreimbursement.service;

import com.example.travelreimbursement.dto.ClaimDTO;
import com.example.travelreimbursement.entity.*;
import com.example.travelreimbursement.exception.InvalidOperationException;
import com.example.travelreimbursement.exception.ResourceNotFoundException;
import com.example.travelreimbursement.exception.UnauthorizedAccessException;
import com.example.travelreimbursement.repository.ApprovalRepository;
import com.example.travelreimbursement.repository.ClaimRepository;
import com.example.travelreimbursement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClaimService {
    
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final ApprovalRepository approvalRepository;
    
    public ClaimService(ClaimRepository claimRepository, UserRepository userRepository,
                        ApprovalRepository approvalRepository) {
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.approvalRepository = approvalRepository;
    }
    
    public ClaimDTO createClaim(Long userId, ClaimDTO claimDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Claim claim = new Claim();
        claim.setUser(user);
        claim.setDescription(claimDTO.getDescription());
        claim.setAmount(claimDTO.getAmount());
        claim.setStatus(ClaimStatus.DRAFT);
        
        if (user.getManager() != null) {
            claim.setManager(user.getManager());
        }
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO submitClaim(Long claimId, Long userId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        if (!claim.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only submit your own claims");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.DRAFT)) {
            throw new InvalidOperationException("Only draft claims can be submitted");
        }
        
        if (claim.getManager() == null) {
            throw new InvalidOperationException("User does not have a manager assigned");
        }
        
        claim.setStatus(ClaimStatus.PENDING_MANAGER_APPROVAL);
        claim.setSubmittedAt(LocalDateTime.now());
        
        Approval managerApproval = new Approval();
        managerApproval.setClaim(claim);
        managerApproval.setApprover(claim.getManager());
        managerApproval.setRole(UserRole.MANAGER);
        managerApproval.setStatus(ApprovalStatus.PENDING);
        approvalRepository.save(managerApproval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO approveClaim(Long claimId, Long managerId, String comments) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new UnauthorizedAccessException("Only managers can approve claims");
        }
        
        if (!claim.getManager().getId().equals(managerId)) {
            throw new UnauthorizedAccessException("You can only approve claims assigned to you");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.PENDING_MANAGER_APPROVAL)) {
            throw new InvalidOperationException("Claim is not in pending manager approval status");
        }
        
        claim.setStatus(ClaimStatus.MANAGER_APPROVED);
        claim.setApprovedAt(LocalDateTime.now());
        
        Approval approval = new Approval();
        approval.setClaim(claim);
        approval.setApprover(manager);
        approval.setRole(UserRole.MANAGER);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(approval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO rejectClaim(Long claimId, Long managerId, String reason) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new UnauthorizedAccessException("Only managers can reject claims");
        }
        
        if (!claim.getManager().getId().equals(managerId)) {
            throw new UnauthorizedAccessException("You can only reject claims assigned to you");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.PENDING_MANAGER_APPROVAL)) {
            throw new InvalidOperationException("Claim is not in pending manager approval status");
        }
        
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setRejectionReason(reason);
        
        Approval approval = new Approval();
        approval.setClaim(claim);
        approval.setApprover(manager);
        approval.setRole(UserRole.MANAGER);
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setComments(reason);
        approval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(approval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO approveBHR(Long claimId, Long hrId, String comments) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR not found with id: " + hrId));
        
        if (!hr.getRole().equals(UserRole.HR)) {
            throw new UnauthorizedAccessException("Only HR can approve claims");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.MANAGER_APPROVED)) {
            throw new InvalidOperationException("Claim must be manager approved before HR approval");
        }
        
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setApprovedAt(LocalDateTime.now());
        
        Approval approval = new Approval();
        approval.setClaim(claim);
        approval.setApprover(hr);
        approval.setRole(UserRole.HR);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(approval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO markAsPaid(Long claimId, Long hrId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR not found with id: " + hrId));
        
        if (!hr.getRole().equals(UserRole.HR)) {
            throw new UnauthorizedAccessException("Only HR can mark claims as paid");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.APPROVED)) {
            throw new InvalidOperationException("Claim must be approved before marking as paid");
        }
        
        claim.setStatus(ClaimStatus.PAID);
        claim.setPaidAt(LocalDateTime.now());
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public List<ClaimDTO> getClaimsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return claimRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClaimDTO> getPendingClaimsByManager(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new UnauthorizedAccessException("Only managers can view pending claims");
        }
        
        return claimRepository.findByManagerIdAndStatus(managerId, ClaimStatus.PENDING_MANAGER_APPROVAL)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClaimDTO> getClaimsByManagerForApproval(Long managerId) {
        return claimRepository.findByManagerId(managerId)
                .stream()
                .filter(claim -> !claim.getStatus().equals(ClaimStatus.DRAFT))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClaimDTO> getAllPendingClaims() {
        return claimRepository.findByStatus(ClaimStatus.PENDING_MANAGER_APPROVAL)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ClaimDTO getClaimById(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        return convertToDTO(claim);
    }
    
    private ClaimDTO convertToDTO(Claim claim) {
        return new ClaimDTO(
                claim.getId(),
                claim.getDescription(),
                claim.getAmount(),
                claim.getStatus(),
                claim.getRejectionReason(),
                claim.getUser().getId(),
                claim.getManager() != null ? claim.getManager().getId() : null,
                claim.getCreatedAt(),
                claim.getSubmittedAt(),
                claim.getApprovedAt(),
                claim.getPaidAt(),
                claim.getUpdatedAt()
        );
    }
}
