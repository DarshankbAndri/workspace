package com.example.cmmsApplication.notification.service;

import com.example.cmmsApplication.notification.dto.NotificationSettingDTO;

/** Service contract for notification settings. */
public interface NotificationSettingsService {
    void seedDefaultsIfMissing();

    NotificationSettingDTO getForAdmin();

    NotificationSettingDTO getRuntimeSettings();

    NotificationSettingDTO update(NotificationSettingDTO dto);
}
