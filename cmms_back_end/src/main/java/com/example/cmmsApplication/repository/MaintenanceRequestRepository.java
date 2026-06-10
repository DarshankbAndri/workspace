package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    boolean existsByRequestNumber(String requestNumber);
    boolean existsByRequestNumberAndIdNot(String requestNumber, Long id);
    long countByStatusIn(java.util.Collection<String> statuses);
}
