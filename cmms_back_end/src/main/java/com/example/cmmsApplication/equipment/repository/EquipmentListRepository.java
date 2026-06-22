package com.example.cmmsApplication.equipment.repository;


import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.entity.EquipmentList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentListRepository extends JpaRepository<EquipmentList, Long>, JpaSpecificationExecutor<EquipmentList> {
}





