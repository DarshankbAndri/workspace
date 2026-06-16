package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.ApprovalAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalActionRepository extends JpaRepository<ApprovalAction, Long> {
    boolean existsByApprovalRequestIdAndApproverUserId(Long approvalRequestId, Long approverUserId);
    long countByApprovalRequestIdAndActionStatus(Long approvalRequestId, String actionStatus);
    List<ApprovalAction> findByApprovalRequestIdOrderByActionAtAsc(Long approvalRequestId);
}
