package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    boolean existsByRequestNumber(String requestNumber);
    boolean existsByRequestNumberAndIdNot(String requestNumber, Long id);
    long countByStatusIn(Collection<String> statuses);
    long countBySiteIdAndStatusIn(Long siteId, Collection<String> statuses);
    List<MaintenanceRequest> findBySiteId(Long siteId);
    List<MaintenanceRequest> findBySiteIdIn(Collection<Long> siteIds);
    List<MaintenanceRequest> findByStatus(String status);
    List<MaintenanceRequest> findBySiteIdInAndStatus(Collection<Long> siteIds, String status);
    List<MaintenanceRequest> findBySiteIdAndStatus(Long siteId, String status);
    List<MaintenanceRequest> findByTargetCompletionDateBeforeAndStatusNotInOrderByTargetCompletionDateAsc(LocalDate date, Collection<String> statuses);
    long countByPmScheduleId(Long pmScheduleId);
    long countByPmScheduleIdAndStatusIn(Long pmScheduleId, Collection<String> statuses);
}
