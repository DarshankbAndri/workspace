package com.example.cmmsApplication.equipment.repository;

import com.example.cmmsApplication.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    @Query("select coalesce(e.operatingStatus, 'UNKNOWN'), count(e) from Equipment e group by coalesce(e.operatingStatus, 'UNKNOWN')")
    List<Object[]> countGroupedByOperatingStatus();

    @Query("select coalesce(e.operatingStatus, 'UNKNOWN'), count(e) from Equipment e where e.site.id in :siteIds group by coalesce(e.operatingStatus, 'UNKNOWN')")
    List<Object[]> countGroupedByOperatingStatusAndSiteIdIn(Collection<Long> siteIds);
}
