package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.Approval;
import com.example.travelreimbursement.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    
    List<Approval> findByClaimId(Long claimId);
    
    List<Approval> findByApproverId(Long approverId);
    
    List<Approval> findByApproverIdAndStatus(Long approverId, ApprovalStatus status);
}
