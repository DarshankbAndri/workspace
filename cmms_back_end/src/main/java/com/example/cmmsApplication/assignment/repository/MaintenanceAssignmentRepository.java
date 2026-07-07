package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
    List<MaintenanceAssignment> findByRequestSiteId(Long siteId);
    List<MaintenanceAssignment> findByRequestSiteIdIn(Collection<Long> siteIds);
    List<MaintenanceAssignment> findByRequestId(Long requestId);
    long countByRequestEquipmentIdAndStatusNotIn(Long equipmentId, Collection<String> statuses);

    @Query("""
            select max(assignment.actualEndDate)
            from MaintenanceAssignment assignment
            where assignment.request.equipment.id = :equipmentId
              and upper(assignment.status) = 'COMPLETED'
            """)
    LocalDate findLastCompletedMaintenanceDateByEquipmentId(Long equipmentId);
}
