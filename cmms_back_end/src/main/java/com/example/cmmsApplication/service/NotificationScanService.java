package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.dto.NotificationSettingDTO;
import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class NotificationScanService {
    private final NotificationSettingsService notificationSettingsService;
    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final NotificationService notificationService;

    public NotificationScanService(NotificationSettingsService notificationSettingsService,
                                   PreventiveMaintenanceScheduleDAO scheduleDAO,
                                   MaintenanceRequestDAO requestDAO,
                                   NotificationService notificationService) {
        this.notificationSettingsService = notificationSettingsService;
        this.scheduleDAO = scheduleDAO;
        this.requestDAO = requestDAO;
        this.notificationService = notificationService;
    }

    public void scanDailyNotifications() {
        NotificationSettingDTO settings = notificationSettingsService.getRuntimeSettings();
        if (!Boolean.TRUE.equals(settings.getEnabled())) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (Boolean.TRUE.equals(settings.getPmDueReminderEnabled())) {
            LocalDate end = today.plusDays(Math.max(settings.getPmReminderDays() == null ? 0 : settings.getPmReminderDays(), 0));
            scheduleDAO.findUpcoming(today, end).stream()
                    .filter(this::canNotifyPmSchedule)
                    .forEach((schedule) -> notificationService.createPmDueReminder(schedule, today));
        }
        if (Boolean.TRUE.equals(settings.getOverdueRequestEnabled())) {
            requestDAO.findOverdue(today).forEach((request) -> notificationService.createOverdueRequestAlert(request, today));
        }
    }

    private boolean canNotifyPmSchedule(PreventiveMaintenanceSchedule schedule) {
        return schedule != null
                && Boolean.TRUE.equals(schedule.getActive())
                && !"PENDING_APPROVAL".equalsIgnoreCase(schedule.getStatus())
                && !"REJECTED".equalsIgnoreCase(schedule.getStatus());
    }
}
