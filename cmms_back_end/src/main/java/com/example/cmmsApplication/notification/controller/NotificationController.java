package com.example.cmmsApplication.notification.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.notification.dto.NotificationDTO;
import com.example.cmmsApplication.notification.dto.NotificationPageDTO;
import com.example.cmmsApplication.notification.service.NotificationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMine(@RequestParam(required = false) String status,
                                                       @RequestParam(required = false) String type,
                                                       @RequestParam(required = false) String priority,
                                                       @RequestParam(required = false) String search,
                                                       @RequestParam(required = false) Integer page,
                                                       @RequestParam(required = false) Integer size) {
        return ResponseFactory.ok(notificationService.searchMine(status, type, priority, search, page, size));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMine() {
        return notificationService.subscribeMine();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<?>> getUnreadCount() {
        return ResponseFactory.ok(Map.of("count", notificationService.getUnreadCount()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<?>> markRead(@PathVariable Long id) {
        return ResponseFactory.ok(notificationService.markRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<?>> markAllRead() {
        notificationService.markAllRead();
        return ResponseFactory.ok(null);
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<?>> archive(@PathVariable Long id) {
        notificationService.archive(id);
        return ResponseFactory.ok(null);
    }
}
