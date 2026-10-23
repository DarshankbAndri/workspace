package com.example.cmmsApplication.preventivemaintenance.service;

import com.example.cmmsApplication.preventivemaintenance.dto.PmScheduleChecklistItemDTO;
import com.example.cmmsApplication.preventivemaintenance.dto.PreventiveMaintenanceScheduleDTO;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import java.time.LocalDate;
import java.util.List;

/** Service contract for preventive maintenance schedule. */
public interface PreventiveMaintenanceScheduleService {
    PreventiveMaintenanceScheduleDTO create(PreventiveMaintenanceScheduleDTO dto);

    PreventiveMaintenanceScheduleDTO update(Long id, PreventiveMaintenanceScheduleDTO dto);

    PreventiveMaintenanceScheduleDTO getById(Long id);

    List<PreventiveMaintenanceScheduleDTO> getAll();

    List<PreventiveMaintenanceScheduleDTO> getUpcoming(int days);

    List<PreventiveMaintenanceScheduleDTO> getCalendar(LocalDate startDate, LocalDate endDate, Long siteId, Long equipmentId);

    List<PreventiveMaintenanceScheduleDTO> generateDueWorkOrders();

    void generateDueWorkOrdersDaily();

    PreventiveMaintenanceScheduleDTO generateWorkOrder(Long id);

    void delete(Long id);

    PreventiveMaintenanceScheduleDTO generateWorkOrderImmediately(Long id);

    void saveChecklistItems(PreventiveMaintenanceSchedule owner, List<PmScheduleChecklistItemDTO> rows);
}
