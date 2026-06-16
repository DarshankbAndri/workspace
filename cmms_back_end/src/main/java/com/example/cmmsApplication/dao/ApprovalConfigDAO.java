package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.ApprovalConfig;
import com.example.cmmsApplication.repository.ApprovalConfigRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ApprovalConfigDAO {
    private final ApprovalConfigRepository repository;

    public ApprovalConfigDAO(ApprovalConfigRepository repository) {
        this.repository = repository;
    }

    public ApprovalConfig save(ApprovalConfig config) { return repository.save(config); }
    public Optional<ApprovalConfig> findById(Long id) { return repository.findById(id); }
    public List<ApprovalConfig> findAll() { return repository.findAll(); }
    public Optional<ApprovalConfig> findActive(String moduleCode, String actionCode) {
        return repository.findByModuleCodeAndActionCodeAndStatus(moduleCode, actionCode, "ACTIVE");
    }
    public boolean existsByModuleCodeAndActionCode(String moduleCode, String actionCode) {
        return repository.existsByModuleCodeAndActionCode(moduleCode, actionCode);
    }
    public boolean existsByModuleCodeAndActionCodeAndIdNot(String moduleCode, String actionCode, Long id) {
        return repository.existsByModuleCodeAndActionCodeAndIdNot(moduleCode, actionCode, id);
    }
}
