package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    boolean existsByEquipmentCode(String equipmentCode);
    boolean existsByEquipmentCodeAndIdNot(String equipmentCode, Long id);
    List<Equipment> findBySiteId(Long siteId);
    List<Equipment> findBySiteIdIn(Collection<Long> siteIds);
    long countBySiteId(Long siteId);
}
