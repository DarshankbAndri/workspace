package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.repository.PreventiveMaintenanceScheduleRepository;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class PreventiveMaintenanceScheduleDAO {
    private final PreventiveMaintenanceScheduleRepository repository;

    public PreventiveMaintenanceScheduleDAO(PreventiveMaintenanceScheduleRepository repository) {
        this.repository = repository;
    }

    public PreventiveMaintenanceSchedule save(PreventiveMaintenanceSchedule schedule) { return repository.save(schedule); }
    public Optional<PreventiveMaintenanceSchedule> findById(Long id) { return repository.findById(id); }
    public List<PreventiveMaintenanceSchedule> findAll() { return repository.findAll(); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public boolean existsByScheduleCode(String scheduleCode) { return repository.existsByScheduleCode(scheduleCode); }
    public boolean existsByScheduleCodeAndIdNot(String scheduleCode, Long id) { return repository.existsByScheduleCodeAndIdNot(scheduleCode, id); }
    public List<PreventiveMaintenanceSchedule> findDue(LocalDate date) { return repository.findByActiveTrueAndNextDueDateLessThanEqualOrderByNextDueDateAsc(date); }
    public List<PreventiveMaintenanceSchedule> findUpcoming(LocalDate start, LocalDate end) { return repository.findByActiveTrueAndNextDueDateBetweenOrderByNextDueDateAsc(start, end); }
}
