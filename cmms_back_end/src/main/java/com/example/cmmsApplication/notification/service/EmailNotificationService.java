package com.example.cmmsApplication.notification.service;

import com.example.cmmsApplication.notification.entity.Notification;

/** Service contract for email notification. */
public interface EmailNotificationService {
    boolean send(Notification notification);
}
