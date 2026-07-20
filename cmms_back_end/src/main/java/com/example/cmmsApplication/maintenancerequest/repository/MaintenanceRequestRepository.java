package com.example.cmmsApplication.maintenancerequest.repository;

import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    boolean existsByRequestNumber(String requestNumber);
    boolean existsByRequestNumberAndIdNot(String requestNumber, Long id);
    long countByStatusIn(Collection<String> statuses);
    long countByStatus(String status);
    long countBySiteIdIn(Collection<Long> siteIds);
    long countBySiteIdAndStatusIn(Long siteId, Collection<String> statuses);
    long countBySiteIdInAndStatus(Collection<Long> siteIds, String status);
    List<MaintenanceRequest> findBySiteId(Long siteId);
    List<MaintenanceRequest> findBySiteIdIn(Collection<Long> siteIds);
    List<MaintenanceRequest> findByStatus(String status);
    List<MaintenanceRequest> findBySiteIdInAndStatus(Collection<Long> siteIds, String status);
    List<MaintenanceRequest> findBySiteIdAndStatus(Long siteId, String status);
    List<MaintenanceRequest> findByTargetCompletionDateBeforeAndStatusNotInOrderByTargetCompletionDateAsc(LocalDate date, Collection<String> statuses);
    long countByPmScheduleId(Long pmScheduleId);
    long countByPmScheduleIdAndStatusIn(Long pmScheduleId, Collection<String> statuses);
    long countByAmcContractId(Long amcContractId);
    long countByEquipmentIdAndStatusNotIn(Long equipmentId, Collection<String> statuses);
    long countByEquipmentIdAndPriorityInAndStatusNotIn(Long equipmentId, Collection<String> priorities, Collection<String> statuses);
    Optional<MaintenanceRequest> findTopByEquipmentIdAndStatusNotInOrderByRequestedDateDescIdDesc(Long equipmentId, Collection<String> statuses);
    long countByPriorityInAndStatusNotIn(Collection<String> priorities, Collection<String> statuses);
    long countBySiteIdInAndPriorityInAndStatusNotIn(Collection<Long> siteIds, Collection<String> priorities, Collection<String> statuses);
    long countByTargetCompletionDateBeforeAndStatusNotIn(LocalDate date, Collection<String> statuses);
    long countBySiteIdInAndTargetCompletionDateBeforeAndStatusNotIn(Collection<Long> siteIds, LocalDate date, Collection<String> statuses);

    @Query("""
            select count(request)
            from MaintenanceRequest request
            where upper(request.status) = 'OPEN'
              and not exists (
                  select assignment.id
                  from MaintenanceAssignment assignment
                  where assignment.request.id = request.id
                    and upper(assignment.status) <> 'CANCELLED'
              )
            """)
    long countUnassignedOpenRequests();

    @Query("""
            select count(request)
            from MaintenanceRequest request
            where request.site.id in :siteIds
              and upper(request.status) = 'OPEN'
              and not exists (
                  select assignment.id
                  from MaintenanceAssignment assignment
                  where assignment.request.id = request.id
                    and upper(assignment.status) <> 'CANCELLED'
              )
            """)
    long countUnassignedOpenRequestsBySiteIds(Collection<Long> siteIds);
}
