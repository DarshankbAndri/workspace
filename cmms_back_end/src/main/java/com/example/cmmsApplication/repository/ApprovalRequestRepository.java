package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    List<ApprovalRequest> findByApprovalStatusOrderByRequestedAtDesc(String approvalStatus);
    List<ApprovalRequest> findBySiteIdInAndApprovalStatusOrderByRequestedAtDesc(Collection<Long> siteIds, String approvalStatus);
    List<ApprovalRequest> findByModuleCodeAndReferenceIdOrderByRequestedAtDesc(String moduleCode, Long referenceId);
    List<ApprovalRequest> findBySiteIdInAndModuleCodeAndReferenceIdOrderByRequestedAtDesc(Collection<Long> siteIds, String moduleCode, Long referenceId);
}
