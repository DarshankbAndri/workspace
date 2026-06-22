package com.example.cmmsApplication.notification.controller;


import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.notification.dto.NotificationDTO;
import com.example.cmmsApplication.notification.dto.NotificationPageDTO;
import com.example.cmmsApplication.notification.service.NotificationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationPageDTO> getMine(@RequestParam(required = false) String status,
                                                       @RequestParam(required = false) String type,
                                                       @RequestParam(required = false) String priority,
                                                       @RequestParam(required = false) String search,
                                                       @RequestParam(required = false) Integer page,
                                                       @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(notificationService.searchMine(status, type, priority, search, page, size));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMine() {
        return notificationService.subscribeMine();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Void> archive(@PathVariable Long id) {
        notificationService.archive(id);
        return ResponseEntity.noContent().build();
    }
}





