package com.example.cmmsApplication.notification.dao;


import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.notification.entity.NotificationSetting;
import com.example.cmmsApplication.notification.repository.NotificationSettingRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class NotificationSettingDAO {
    private final NotificationSettingRepository repository;

    public NotificationSettingDAO(NotificationSettingRepository repository) {
        this.repository = repository;
    }

    public NotificationSetting save(NotificationSetting setting) { return repository.save(setting); }
    public Optional<NotificationSetting> findCurrent() { return repository.findFirstByOrderByIdAsc(); }
    public long count() { return repository.count(); }
}
