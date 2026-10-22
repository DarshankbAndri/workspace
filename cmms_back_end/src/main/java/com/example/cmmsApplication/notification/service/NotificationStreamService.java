package com.example.cmmsApplication.notification.service;

import com.example.cmmsApplication.notification.dto.NotificationDTO;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Service contract for notification stream. */
public interface NotificationStreamService {
    SseEmitter subscribe(Long userId, long unreadCount);

    void publishCreated(Long userId, NotificationDTO notification);

    void publishUpdated(Long userId, NotificationDTO notification);

    void publishUnreadCount(Long userId, long unreadCount);

    void heartbeat();
}
