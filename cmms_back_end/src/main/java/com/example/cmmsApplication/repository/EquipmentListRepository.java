package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.EquipmentList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentListRepository extends JpaRepository<EquipmentList, Long>, JpaSpecificationExecutor<EquipmentList> {
}
