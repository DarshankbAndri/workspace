package com.example.cmmsApplication.notification.service;


import com.example.cmmsApplication.common.observability.ObservabilityMetrics;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.maintenancerequest.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.preventivemaintenance.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.notification.dto.NotificationSettingDTO;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
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
    private final ObservabilityMetrics observabilityMetrics;

    public NotificationScanService(NotificationSettingsService notificationSettingsService,
                                   PreventiveMaintenanceScheduleDAO scheduleDAO,
                                   MaintenanceRequestDAO requestDAO,
                                   NotificationService notificationService,
                                   ObservabilityMetrics observabilityMetrics) {
        this.notificationSettingsService = notificationSettingsService;
        this.scheduleDAO = scheduleDAO;
        this.requestDAO = requestDAO;
        this.notificationService = notificationService;
        this.observabilityMetrics = observabilityMetrics;
    }

    public void scanDailyNotifications() {
        try {
            NotificationSettingDTO settings = notificationSettingsService.getRuntimeSettings();
            if (!Boolean.TRUE.equals(settings.getEnabled())) {
                observabilityMetrics.recordNotificationJob("daily_notification_scan", true);
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
            observabilityMetrics.recordNotificationJob("daily_notification_scan", true);
        } catch (RuntimeException ex) {
            observabilityMetrics.recordNotificationJob("daily_notification_scan", false);
            throw ex;
        }
    }

    private boolean canNotifyPmSchedule(PreventiveMaintenanceSchedule schedule) {
        return schedule != null
                && Boolean.TRUE.equals(schedule.getActive())
                && !"PENDING_APPROVAL".equalsIgnoreCase(schedule.getStatus())
                && !"REJECTED".equalsIgnoreCase(schedule.getStatus());
    }
}





