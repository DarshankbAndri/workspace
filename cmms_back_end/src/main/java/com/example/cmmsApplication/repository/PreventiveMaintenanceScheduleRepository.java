package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PreventiveMaintenanceScheduleRepository extends JpaRepository<PreventiveMaintenanceSchedule, Long> {
    boolean existsByScheduleCode(String scheduleCode);
    boolean existsByScheduleCodeAndIdNot(String scheduleCode, Long id);
    List<PreventiveMaintenanceSchedule> findByActiveTrueAndNextDueDateLessThanEqualOrderByNextDueDateAsc(LocalDate date);
    List<PreventiveMaintenanceSchedule> findByActiveTrueAndNextDueDateBetweenOrderByNextDueDateAsc(LocalDate start, LocalDate end);
}
