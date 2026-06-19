package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceSpareUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceSpareUsageRepository extends JpaRepository<MaintenanceSpareUsage, Long> {
    List<MaintenanceSpareUsage> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);
    Optional<MaintenanceSpareUsage> findByIdAndAssignmentId(Long id, Long assignmentId);
    boolean existsByAssignmentIdAndStockId(Long assignmentId, Long stockId);
}
