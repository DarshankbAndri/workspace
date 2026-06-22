package com.example.cmmsApplication.downtime.repository;

import com.example.cmmsApplication.downtime.entity.EquipmentDowntimeList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentDowntimeListRepository extends JpaRepository<EquipmentDowntimeList, Long>, JpaSpecificationExecutor<EquipmentDowntimeList> {
}




