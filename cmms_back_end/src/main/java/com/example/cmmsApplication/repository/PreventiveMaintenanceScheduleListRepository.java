package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.PreventiveMaintenanceScheduleList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PreventiveMaintenanceScheduleListRepository extends JpaRepository<PreventiveMaintenanceScheduleList, Long>, JpaSpecificationExecutor<PreventiveMaintenanceScheduleList> {
}
