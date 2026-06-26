package com.example.cmmsApplication.notification.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.notification.dto.NotificationSettingDTO;
import com.example.cmmsApplication.notification.service.NotificationSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/notification-settings")
public class NotificationSettingsController {
    private final NotificationSettingsService notificationSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getSettings() {
        return ResponseFactory.ok(notificationSettingsService.getForAdmin());
    }

    @PutMapping
    public ResponseEntity<ApiResponse<?>> updateSettings(@RequestBody NotificationSettingDTO dto) {
        return ResponseFactory.ok(notificationSettingsService.update(dto));
    }
}
