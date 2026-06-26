package com.example.cmmsApplication.notification.repository;


import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.notification.entity.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {
    Optional<NotificationSetting> findFirstByOrderByIdAsc();
}
