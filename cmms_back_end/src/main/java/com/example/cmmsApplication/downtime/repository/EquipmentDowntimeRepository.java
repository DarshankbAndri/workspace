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
    Optional<EquipmentDowntime> findTopByRequestIdOrderByDowntimeStartDescIdDesc(Long requestId);
    long countByEquipmentIdAndDowntimeEndIsNull(Long equipmentId);
    Optional<EquipmentDowntime> findTopByEquipmentIdOrderByDowntimeStartDescIdDesc(Long equipmentId);
    Optional<EquipmentDowntime> findTopByEquipmentIdAndPlannedFalseOrderByDowntimeStartDescIdDesc(Long equipmentId);

    @Query("""
            select count(d)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and (:excludeId is null or d.id <> :excludeId)
              and upper(d.status) not in ('CLOSED', 'CANCELLED')
              and (d.downtimeEnd is null or d.downtimeEnd > :start)
              and (:end is null or d.downtimeStart < :end)
            """)
    long countOverlappingActiveDowntime(Long equipmentId, Long excludeId, LocalDateTime start, LocalDateTime end);

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

    @Query("""
            select count(d)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.planned = false
              and d.downtimeStart >= :start
            """)
    Long countFailuresSince(Long equipmentId, LocalDateTime start);

    @Query("""
            select coalesce(sum(d.downtimeMinutes), 0)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.planned = false
              and d.downtimeStart >= :start
            """)
    Long sumFailureDowntimeMinutesSince(Long equipmentId, LocalDateTime start);

    @Query("""
            select coalesce(avg(d.downtimeMinutes), 0)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.planned = false
              and d.downtimeMinutes is not null
            """)
    Double averageFailureDowntimeMinutes(Long equipmentId);

    @Query("""
            select count(d)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.planned = false
              and upper(d.reason) = upper(:reason)
              and d.downtimeStart >= :start
            """)
    Long countRepeatedFailuresByReasonSince(Long equipmentId, String reason, LocalDateTime start);
}
