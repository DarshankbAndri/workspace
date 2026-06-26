package com.example.cmmsApplication.maintenancerequest.repository;


import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRequestListRepository extends JpaRepository<MaintenanceRequestList, Long>, JpaSpecificationExecutor<MaintenanceRequestList> {
}
