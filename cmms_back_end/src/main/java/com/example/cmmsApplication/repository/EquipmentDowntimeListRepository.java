package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.EquipmentDowntimeList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentDowntimeListRepository extends JpaRepository<EquipmentDowntimeList, Long>, JpaSpecificationExecutor<EquipmentDowntimeList> {
}
