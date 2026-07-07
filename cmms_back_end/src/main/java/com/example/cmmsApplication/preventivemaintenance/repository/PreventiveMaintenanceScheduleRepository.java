package com.example.cmmsApplication.preventivemaintenance.repository;

import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface PreventiveMaintenanceScheduleRepository extends JpaRepository<PreventiveMaintenanceSchedule, Long> {
    boolean existsByScheduleCode(String scheduleCode);
    boolean existsByScheduleCodeAndIdNot(String scheduleCode, Long id);
    List<PreventiveMaintenanceSchedule> findByActiveTrueAndNextDueDateLessThanEqualOrderByNextDueDateAsc(LocalDate date);
    List<PreventiveMaintenanceSchedule> findByActiveTrueAndNextDueDateBetweenOrderByNextDueDateAsc(LocalDate start, LocalDate end);
    long countByEquipmentIdAndActiveTrue(Long equipmentId);
    long countByEquipmentIdAndActiveTrueAndNextDueDateBefore(Long equipmentId, LocalDate date);

    @Query("""
            select min(schedule.nextDueDate)
            from PreventiveMaintenanceSchedule schedule
            where schedule.equipment.id = :equipmentId
              and schedule.active = true
            """)
    LocalDate findNextDueDateByEquipmentId(Long equipmentId);

    @Query("""
            SELECT schedule FROM PreventiveMaintenanceSchedule schedule
            WHERE schedule.active = true
              AND schedule.nextDueDate BETWEEN :start AND :end
              AND (:siteId IS NULL OR schedule.site.id = :siteId)
              AND (:equipmentId IS NULL OR schedule.equipment.id = :equipmentId)
              AND (:admin = true OR schedule.site.id IN :allowedSiteIds)
            ORDER BY schedule.nextDueDate ASC, schedule.id ASC
            """)
    List<PreventiveMaintenanceSchedule> findCalendar(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("siteId") Long siteId,
            @Param("equipmentId") Long equipmentId,
            @Param("admin") boolean admin,
            @Param("allowedSiteIds") Collection<Long> allowedSiteIds);
}
