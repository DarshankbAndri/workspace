package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
    List<MaintenanceAssignment> findByRequestSiteId(Long siteId);
    List<MaintenanceAssignment> findByRequestSiteIdIn(Collection<Long> siteIds);
}




