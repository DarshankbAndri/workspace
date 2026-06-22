package com.example.cmmsApplication.approval.repository;

import com.example.cmmsApplication.approval.entity.ApprovalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovalConfigRepository extends JpaRepository<ApprovalConfig, Long> {
    Optional<ApprovalConfig> findByModuleCodeAndActionCodeAndStatus(String moduleCode, String actionCode, String status);
    boolean existsByModuleCodeAndActionCode(String moduleCode, String actionCode);
    boolean existsByModuleCodeAndActionCodeAndIdNot(String moduleCode, String actionCode, Long id);
}




