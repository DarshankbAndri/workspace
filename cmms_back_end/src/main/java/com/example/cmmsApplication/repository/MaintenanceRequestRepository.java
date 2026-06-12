package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    boolean existsByRequestNumber(String requestNumber);
    boolean existsByRequestNumberAndIdNot(String requestNumber, Long id);
    long countByStatusIn(Collection<String> statuses);
    long countBySiteIdAndStatusIn(Long siteId, Collection<String> statuses);
    List<MaintenanceRequest> findBySiteId(Long siteId);
    long countByPmScheduleId(Long pmScheduleId);
    long countByPmScheduleIdAndStatusIn(Long pmScheduleId, Collection<String> statuses);
}
