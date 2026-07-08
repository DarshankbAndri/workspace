package com.example.cmmsApplication.spareparts.repository;

import com.example.cmmsApplication.spareparts.entity.MaintenanceSpareUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceSpareUsageRepository extends JpaRepository<MaintenanceSpareUsage, Long> {
    List<MaintenanceSpareUsage> findAllByOrderByCreatedAtDesc();
    List<MaintenanceSpareUsage> findByStatusOrderByCreatedAtDesc(String status);
    List<MaintenanceSpareUsage> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);
    Optional<MaintenanceSpareUsage> findByIdAndAssignmentId(Long id, Long assignmentId);
    boolean existsByAssignmentIdAndStockId(Long assignmentId, Long stockId);

    @Query("""
            select coalesce(sum(usage.totalCost), 0)
            from MaintenanceSpareUsage usage
            where usage.assignment.request.equipment.id = :equipmentId
              and upper(usage.status) in ('ISSUED', 'PARTIALLY_CONSUMED', 'CONSUMED', 'RETURNED')
            """)
    BigDecimal sumMaterialCostByEquipmentId(Long equipmentId);
}
