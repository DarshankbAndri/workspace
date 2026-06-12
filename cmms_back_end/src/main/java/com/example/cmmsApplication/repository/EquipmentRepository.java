package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    boolean existsByEquipmentCode(String equipmentCode);
    boolean existsByEquipmentCodeAndIdNot(String equipmentCode, Long id);
    List<Equipment> findBySiteId(Long siteId);
    long countBySiteId(Long siteId);
}
