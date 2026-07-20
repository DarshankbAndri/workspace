package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
    List<MaintenanceAssignment> findByRequestSiteId(Long siteId);
    List<MaintenanceAssignment> findByRequestSiteIdIn(Collection<Long> siteIds);
    List<MaintenanceAssignment> findByRequestId(Long requestId);
    Optional<MaintenanceAssignment> findTopByRequestIdOrderByCreatedAtDescIdDesc(Long requestId);
    long countByRequestEquipmentIdAndStatusNotIn(Long equipmentId, Collection<String> statuses);

    @Query("""
            select max(assignment.actualEndDate)
            from MaintenanceAssignment assignment
            where assignment.request.equipment.id = :equipmentId
              and upper(assignment.status) = 'COMPLETED'
            """)
    LocalDate findLastCompletedMaintenanceDateByEquipmentId(Long equipmentId);

    @Query("""
            select coalesce(sum(coalesce(assignment.actualCost, assignment.estimatedCost, 0)), 0)
            from MaintenanceAssignment assignment
            where assignment.request.equipment.id = :equipmentId
              and upper(assignment.status) <> 'CANCELLED'
            """)
    BigDecimal sumMaintenanceCostByEquipmentId(Long equipmentId);
}
