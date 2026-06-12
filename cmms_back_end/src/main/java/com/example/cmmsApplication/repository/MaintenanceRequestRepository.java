package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    boolean existsByRequestNumber(String requestNumber);
    boolean existsByRequestNumberAndIdNot(String requestNumber, Long id);
    long countByStatusIn(Collection<String> statuses);
    long countByPmScheduleId(Long pmScheduleId);
    long countByPmScheduleIdAndStatusIn(Long pmScheduleId, Collection<String> statuses);
}
