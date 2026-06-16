package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceAssignmentList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceAssignmentListRepository extends JpaRepository<MaintenanceAssignmentList, Long>, JpaSpecificationExecutor<MaintenanceAssignmentList> {
}
