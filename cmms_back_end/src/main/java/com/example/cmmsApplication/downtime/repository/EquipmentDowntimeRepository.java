package com.example.cmmsApplication.downtime.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.downtime.entity.EquipmentDowntime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentDowntimeRepository extends JpaRepository<EquipmentDowntime, Long> {
    List<EquipmentDowntime> findByEquipmentId(Long equipmentId);
    List<EquipmentDowntime> findBySiteId(Long siteId);
    List<EquipmentDowntime> findBySiteIdIn(Collection<Long> siteIds);
    List<EquipmentDowntime> findBySiteIdAndEquipmentId(Long siteId, Long equipmentId);
    List<EquipmentDowntime> findBySiteIdInAndEquipmentId(Collection<Long> siteIds, Long equipmentId);
    long countByEquipmentIdAndDowntimeEndIsNull(Long equipmentId);
    Optional<EquipmentDowntime> findTopByEquipmentIdOrderByDowntimeStartDescIdDesc(Long equipmentId);

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d")
    Long sumDowntimeMinutes();

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d where d.site.id = :siteId")
    Long sumDowntimeMinutesBySiteId(Long siteId);

    @Query("""
            select coalesce(sum(d.downtimeMinutes), 0)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.downtimeStart >= :start
              and d.downtimeStart < :end
            """)
    Long sumDowntimeMinutesByEquipmentIdAndDowntimeStartBetween(Long equipmentId, LocalDateTime start, LocalDateTime end);
}
