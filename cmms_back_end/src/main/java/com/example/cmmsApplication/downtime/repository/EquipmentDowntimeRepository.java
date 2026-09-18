package com.example.cmmsApplication.downtime.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.downtime.entity.EquipmentDowntime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
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
              and d.downtimeStart < :end
            """)
    long countOverlappingActiveDowntime(Long equipmentId, Long excludeId, Instant start, Instant end);

    @Query("""
            select count(d)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and (:excludeId is null or d.id <> :excludeId)
              and upper(d.status) not in ('CLOSED', 'CANCELLED')
              and (d.downtimeEnd is null or d.downtimeEnd > :start)
            """)
    long countOverlappingActiveOpenEndedDowntime(Long equipmentId, Long excludeId, Instant start);

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d")
    Long sumDowntimeMinutes();

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d where d.site.id = :siteId")
    Long sumDowntimeMinutesBySiteId(Long siteId);

    @Query(value = """
            select cast(extract(month from d.downtime_start at time zone :businessZone) as integer),
                   coalesce(sum(d.downtime_minutes), 0)
            from equipment_downtime d
            where d.downtime_start >= :start and d.downtime_start < :end
            group by 1
            order by 1
            """, nativeQuery = true)
    List<Object[]> sumMonthlyDowntime(Instant start, Instant end, String businessZone);

    @Query(value = """
            select cast(extract(month from d.downtime_start at time zone :businessZone) as integer),
                   coalesce(sum(d.downtime_minutes), 0)
            from equipment_downtime d
            where d.site_id in (:siteIds)
              and d.downtime_start >= :start and d.downtime_start < :end
            group by 1
            order by 1
            """, nativeQuery = true)
    List<Object[]> sumMonthlyDowntimeBySiteIds(Collection<Long> siteIds, Instant start, Instant end, String businessZone);

    @Query("""
            select coalesce(sum(d.downtimeMinutes), 0)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.downtimeStart >= :start
              and d.downtimeStart < :end
            """)
    Long sumDowntimeMinutesByEquipmentIdAndDowntimeStartBetween(Long equipmentId, Instant start, Instant end);

    @Query("""
            select count(d)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.planned = false
              and d.downtimeStart >= :start
            """)
    Long countFailuresSince(Long equipmentId, Instant start);

    @Query("""
            select coalesce(sum(d.downtimeMinutes), 0)
            from EquipmentDowntime d
            where d.equipment.id = :equipmentId
              and d.planned = false
              and d.downtimeStart >= :start
            """)
    Long sumFailureDowntimeMinutesSince(Long equipmentId, Instant start);

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
    Long countRepeatedFailuresByReasonSince(Long equipmentId, String reason, Instant start);
}
