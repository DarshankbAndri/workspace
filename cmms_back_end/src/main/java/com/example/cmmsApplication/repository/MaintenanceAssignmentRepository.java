package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
}
