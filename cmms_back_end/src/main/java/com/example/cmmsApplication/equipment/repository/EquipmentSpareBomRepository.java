package com.example.cmmsApplication.equipment.repository;

import com.example.cmmsApplication.equipment.entity.EquipmentSpareBom;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentSpareBomRepository extends JpaRepository<EquipmentSpareBom, Long> {
    List<EquipmentSpareBom> findByEquipmentIdOrderByCriticalityAscBomIdDesc(Long equipmentId);

    Optional<EquipmentSpareBom> findByBomIdAndEquipmentId(Long bomId, Long equipmentId);

    boolean existsByEquipmentIdAndStockId(Long equipmentId, Long stockId);

    boolean existsByEquipmentIdAndStockIdAndBomIdNot(Long equipmentId, Long stockId, Long bomId);
}
