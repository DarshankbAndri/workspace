package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.EquipmentDowntime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentDowntimeRepository extends JpaRepository<EquipmentDowntime, Long> {
    List<EquipmentDowntime> findByEquipmentId(Long equipmentId);
    List<EquipmentDowntime> findBySiteId(Long siteId);
    List<EquipmentDowntime> findBySiteIdAndEquipmentId(Long siteId, Long equipmentId);

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d")
    Long sumDowntimeMinutes();

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d where d.site.id = :siteId")
    Long sumDowntimeMinutesBySiteId(Long siteId);
}
