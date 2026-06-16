package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.ApprovalAction;
import com.example.cmmsApplication.repository.ApprovalActionRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApprovalActionDAO {
    private final ApprovalActionRepository repository;

    public ApprovalActionDAO(ApprovalActionRepository repository) {
        this.repository = repository;
    }

    public ApprovalAction save(ApprovalAction action) { return repository.save(action); }
    public boolean existsByApprovalRequestIdAndApproverUserId(Long requestId, Long userId) {
        return repository.existsByApprovalRequestIdAndApproverUserId(requestId, userId);
    }
    public long countByApprovalRequestIdAndActionStatus(Long requestId, String status) {
        return repository.countByApprovalRequestIdAndActionStatus(requestId, status);
    }
    public List<ApprovalAction> findByApprovalRequestId(Long requestId) {
        return repository.findByApprovalRequestIdOrderByActionAtAsc(requestId);
    }
}
