package com.example.cmmsApplication.notification.service;

import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

/** Service contract for notification scheduler. */
public interface NotificationSchedulerService extends SchedulingConfigurer {
    void configureTasks(ScheduledTaskRegistrar taskRegistrar);
}
