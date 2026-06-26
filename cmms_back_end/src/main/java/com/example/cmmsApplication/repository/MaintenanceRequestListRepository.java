package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.MaintenanceRequestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRequestListRepository extends JpaRepository<MaintenanceRequestList, Long>, JpaSpecificationExecutor<MaintenanceRequestList> {
}
