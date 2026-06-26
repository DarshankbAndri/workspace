package com.example.cmmsApplication.notification.service;


import com.example.cmmsApplication.notification.entity.Notification;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

@Service
public class NotificationSchedulerService implements SchedulingConfigurer {
    private static final String DEFAULT_CRON = "0 0 7 * * *";

    private final NotificationSettingsService notificationSettingsService;
    private final NotificationScanService notificationScanService;

    public NotificationSchedulerService(NotificationSettingsService notificationSettingsService,
                                        NotificationScanService notificationScanService) {
        this.notificationSettingsService = notificationSettingsService;
        this.notificationScanService = notificationScanService;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.addTriggerTask(notificationScanService::scanDailyNotifications, notificationTrigger());
    }

    private Trigger notificationTrigger() {
        return (triggerContext) -> {
            String cron = notificationSettingsService.getRuntimeSettings().getScanCron();
            CronTrigger cronTrigger = new CronTrigger(cron == null || cron.isBlank() ? DEFAULT_CRON : cron);
            return cronTrigger.nextExecution(triggerContext);
        };
    }
}





