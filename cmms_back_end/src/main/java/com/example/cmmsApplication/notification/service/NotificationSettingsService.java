package com.example.cmmsApplication.notification.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.common.config.NotificationProperties;
import com.example.cmmsApplication.notification.dao.NotificationSettingDAO;
import com.example.cmmsApplication.notification.dto.NotificationSettingDTO;
import com.example.cmmsApplication.notification.entity.NotificationSetting;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationSettingsService {
    private static final String DEFAULT_CRON = "0 0 7 * * *";
    private static final String DEFAULT_SCAN_TIME = "07:00";
    private static final DateTimeFormatter SCAN_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final NotificationSettingDAO settingDAO;
    private final NotificationProperties properties;
    private final AccessControlService accessControlService;

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultsIfMissing() {
        if (settingDAO.count() > 0) {
            settingDAO.findCurrent()
                    .filter((setting) -> setting.getEmailEnabled() == null)
                    .ifPresent((setting) -> {
                        setting.setEmailEnabled(properties.isEmailEnabled());
                        settingDAO.save(setting);
                    });
            return;
        }
        settingDAO.save(createDefaultSetting());
    }

    private NotificationSetting createDefaultSetting() {
        NotificationSetting setting = new NotificationSetting();
        setting.setEnabled(properties.isEnabled());
        setting.setInAppEnabled(properties.isInAppEnabled());
        setting.setEmailEnabled(properties.isEmailEnabled());
        setting.setPmDueReminderEnabled(properties.isPmDueReminderEnabled());
        setting.setOverdueRequestEnabled(properties.isOverdueRequestEnabled());
        setting.setApprovalPendingEnabled(properties.isApprovalPendingEnabled());
        setting.setPmReminderDays(Math.max(properties.getPmReminderDays(), 0));
        setting.setScanCron(validCronOrDefault(properties.getScanCron()));
        setting.setPmRecipientRoleCodes(joinRoles(properties.getPmRecipientRoleCodes()));
        setting.setOverdueRecipientRoleCodes(joinRoles(properties.getOverdueRecipientRoleCodes()));
        setting.setApprovalFallbackRoleCodes(joinRoles(properties.getApprovalFallbackRoleCodes()));
        return setting;
    }

    public NotificationSettingDTO getForAdmin() {
        accessControlService.validatePermission("NOTIFICATION_CONFIG_VIEW");
        return toDTO(getCurrentEntity());
    }

    public NotificationSettingDTO getRuntimeSettings() {
        return toDTO(getCurrentEntity());
    }

    public NotificationSettingDTO update(NotificationSettingDTO dto) {
        accessControlService.validatePermission("NOTIFICATION_CONFIG_UPDATE");
        validate(dto);
        NotificationSetting setting = getCurrentEntity();
        apply(setting, dto);
        setting.setUpdatedBy(accessControlService.getCurrentUser());
        return toDTO(settingDAO.save(setting));
    }

    private NotificationSetting getCurrentEntity() {
        NotificationSetting setting = settingDAO.findCurrent().orElseGet(() -> settingDAO.save(createDefaultSetting()));
        if (setting.getEmailEnabled() == null) {
            setting.setEmailEnabled(properties.isEmailEnabled());
            return settingDAO.save(setting);
        }
        return setting;
    }

    private void apply(NotificationSetting setting, NotificationSettingDTO dto) {
        setting.setEnabled(Boolean.TRUE.equals(dto.getEnabled()));
        setting.setInAppEnabled(Boolean.TRUE.equals(dto.getInAppEnabled()));
        setting.setEmailEnabled(Boolean.TRUE.equals(dto.getEmailEnabled()));
        setting.setPmDueReminderEnabled(Boolean.TRUE.equals(dto.getPmDueReminderEnabled()));
        setting.setOverdueRequestEnabled(Boolean.TRUE.equals(dto.getOverdueRequestEnabled()));
        setting.setApprovalPendingEnabled(Boolean.TRUE.equals(dto.getApprovalPendingEnabled()));
        setting.setPmReminderDays(dto.getPmReminderDays());
        setting.setScanCron(toDailyCron(dto.getScanTime()));
        setting.setPmRecipientRoleCodes(joinRoles(dto.getPmRecipientRoleCodes()));
        setting.setOverdueRecipientRoleCodes(joinRoles(dto.getOverdueRecipientRoleCodes()));
        setting.setApprovalFallbackRoleCodes(joinRoles(dto.getApprovalFallbackRoleCodes()));
    }

    private void validate(NotificationSettingDTO dto) {
        if (dto == null) {
            throw new InvalidOperationException("Notification settings are required");
        }
        if (dto.getPmReminderDays() == null || dto.getPmReminderDays() < 0) {
            throw new InvalidOperationException("PM reminder days must be 0 or greater");
        }
        parseScanTime(dto.getScanTime());
    }

    private String validCronOrDefault(String value) {
        String cron = value == null || value.isBlank() ? DEFAULT_CRON : value.trim();
        return CronExpression.isValidExpression(cron) ? cron : DEFAULT_CRON;
    }

    private LocalTime parseScanTime(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidOperationException("Scan time is required");
        }
        try {
            return LocalTime.parse(value.trim(), SCAN_TIME_FORMATTER);
        } catch (DateTimeParseException ex) {
            throw new InvalidOperationException("Scan time must be in HH:mm format");
        }
    }

    private String toDailyCron(String scanTime) {
        LocalTime time = parseScanTime(scanTime);
        return String.format("0 %d %d * * *", time.getMinute(), time.getHour());
    }

    private String toScanTime(String cron) {
        String effectiveCron = validCronOrDefault(cron);
        String[] parts = effectiveCron.trim().split("\\s+");
        if (parts.length == 6 && "0".equals(parts[0]) && "*".equals(parts[3]) && "*".equals(parts[4]) && "*".equals(parts[5])) {
            try {
                int minute = Integer.parseInt(parts[1]);
                int hour = Integer.parseInt(parts[2]);
                if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                    return String.format("%02d:%02d", hour, minute);
                }
            } catch (NumberFormatException ignored) {
                return DEFAULT_SCAN_TIME;
            }
        }
        return DEFAULT_SCAN_TIME;
    }

    private String joinRoles(List<String> roles) {
        if (roles == null) {
            return "";
        }
        return roles.stream()
                .filter((role) -> role != null && !role.isBlank())
                .map((role) -> role.trim().toUpperCase(Locale.ROOT))
                .distinct()
                .collect(Collectors.joining(","));
    }

    private List<String> splitRoles(String roles) {
        if (roles == null || roles.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter((role) -> !role.isBlank())
                .collect(Collectors.toList());
    }

    private NotificationSettingDTO toDTO(NotificationSetting setting) {
        NotificationSettingDTO dto = new NotificationSettingDTO();
        dto.setId(setting.getId());
        dto.setEnabled(setting.getEnabled());
        dto.setInAppEnabled(setting.getInAppEnabled());
        dto.setEmailEnabled(Boolean.TRUE.equals(setting.getEmailEnabled()));
        dto.setPmDueReminderEnabled(setting.getPmDueReminderEnabled());
        dto.setOverdueRequestEnabled(setting.getOverdueRequestEnabled());
        dto.setApprovalPendingEnabled(setting.getApprovalPendingEnabled());
        dto.setPmReminderDays(setting.getPmReminderDays());
        dto.setScanCron(setting.getScanCron());
        dto.setScanTime(toScanTime(setting.getScanCron()));
        dto.setPmRecipientRoleCodes(splitRoles(setting.getPmRecipientRoleCodes()));
        dto.setOverdueRecipientRoleCodes(splitRoles(setting.getOverdueRecipientRoleCodes()));
        dto.setApprovalFallbackRoleCodes(splitRoles(setting.getApprovalFallbackRoleCodes()));
        dto.setUpdatedById(setting.getUpdatedBy() == null ? null : setting.getUpdatedBy().getId());
        dto.setUpdatedByName(userName(setting.getUpdatedBy()));
        dto.setCreatedAt(setting.getCreatedAt());
        dto.setUpdatedAt(setting.getUpdatedAt());
        return dto;
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
