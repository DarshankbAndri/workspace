package com.example.cmmsApplication.service;

import com.example.cmmsApplication.config.NotificationProperties;
import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class NotificationSchedulerService {
    private final NotificationProperties properties;
    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final NotificationService notificationService;

    public NotificationSchedulerService(NotificationProperties properties,
                                        PreventiveMaintenanceScheduleDAO scheduleDAO,
                                        MaintenanceRequestDAO requestDAO,
                                        NotificationService notificationService) {
        this.properties = properties;
        this.scheduleDAO = scheduleDAO;
        this.requestDAO = requestDAO;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "${cmms.notification.scan-cron:0 0 7 * * *}")
    @Transactional
    public void scanDailyNotifications() {
        if (!properties.isEnabled()) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (properties.isPmDueReminderEnabled()) {
            LocalDate end = today.plusDays(Math.max(properties.getPmReminderDays(), 0));
            scheduleDAO.findUpcoming(today, end).stream()
                    .filter(this::canNotifyPmSchedule)
                    .forEach((schedule) -> notificationService.createPmDueReminder(schedule, today));
        }
        if (properties.isOverdueRequestEnabled()) {
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
