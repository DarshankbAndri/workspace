package com.example.cmmsApplication.approval.dao;

import com.example.cmmsApplication.approval.entity.ApprovalRequest;
import com.example.cmmsApplication.approval.repository.ApprovalRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class ApprovalRequestDAO {
    private final ApprovalRequestRepository repository;

    public ApprovalRequestDAO(ApprovalRequestRepository repository) {
        this.repository = repository;
    }

    public ApprovalRequest save(ApprovalRequest request) { return repository.save(request); }
    public Optional<ApprovalRequest> findById(Long id) { return repository.findById(id); }
    public List<ApprovalRequest> findPending() { return repository.findByApprovalStatusOrderByRequestedAtDesc("PENDING"); }
    public List<ApprovalRequest> findPendingBySiteIds(Collection<Long> siteIds) {
        return repository.findBySiteIdInAndApprovalStatusOrderByRequestedAtDesc(siteIds, "PENDING");
    }
    public List<ApprovalRequest> findHistory(String moduleCode, Long referenceId) {
        return repository.findByModuleCodeAndReferenceIdOrderByRequestedAtDesc(moduleCode, referenceId);
    }
    public List<ApprovalRequest> findHistoryBySiteIds(Collection<Long> siteIds, String moduleCode, Long referenceId) {
        return repository.findBySiteIdInAndModuleCodeAndReferenceIdOrderByRequestedAtDesc(siteIds, moduleCode, referenceId);
    }
    public Page<ApprovalRequest> search(Specification<ApprovalRequest> specification, Pageable pageable) {
        return repository.findAll(specification, pageable);
    }
}
