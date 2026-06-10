package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    boolean existsByEquipmentCode(String equipmentCode);
    boolean existsByEquipmentCodeAndIdNot(String equipmentCode, Long id);
}
