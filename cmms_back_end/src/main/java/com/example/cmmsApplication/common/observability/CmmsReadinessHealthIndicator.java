package com.example.cmmsApplication.common.observability;

import com.example.cmmsApplication.notification.service.NotificationSettingsService;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component("cmmsReadiness")
public class CmmsReadinessHealthIndicator implements HealthIndicator {
    private final DataSource dataSource;
    private final NotificationSettingsService notificationSettingsService;

    public CmmsReadinessHealthIndicator(DataSource dataSource, NotificationSettingsService notificationSettingsService) {
        this.dataSource = dataSource;
        this.notificationSettingsService = notificationSettingsService;
    }

    @Override
    public Health health() {
        Health.Builder builder = Health.up();
        try (Connection connection = dataSource.getConnection()) {
            builder.withDetail("database", connection.isValid(2) ? "available" : "unavailable");
        } catch (Exception ex) {
            return Health.down().withDetail("database", "unavailable").build();
        }

        try {
            String scanCron = notificationSettingsService.getRuntimeSettings().getScanCron();
            builder.withDetail("notificationScheduler", scanCron == null || scanCron.isBlank() ? "default" : "configured");
        } catch (Exception ex) {
            return Health.down().withDetail("notificationScheduler", "configuration_unavailable").build();
        }
        return builder.build();
    }
}
