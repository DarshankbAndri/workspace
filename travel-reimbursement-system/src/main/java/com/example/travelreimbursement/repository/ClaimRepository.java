package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.Claim;
import com.example.travelreimbursement.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    
    List<Claim> findByUserId(Long userId);
    
    List<Claim> findByManagerIdAndStatus(Long managerId, ClaimStatus status);
    
    List<Claim> findByManagerId(Long managerId);
    
    List<Claim> findByStatus(ClaimStatus status);
    
    List<Claim> findByUserIdAndStatus(Long userId, ClaimStatus status);
}
