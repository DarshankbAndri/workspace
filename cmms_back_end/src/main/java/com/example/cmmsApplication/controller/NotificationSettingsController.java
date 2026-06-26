package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.NotificationSettingDTO;
import com.example.cmmsApplication.service.NotificationSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/notification-settings")
public class NotificationSettingsController {
    private final NotificationSettingsService notificationSettingsService;

    public NotificationSettingsController(NotificationSettingsService notificationSettingsService) {
        this.notificationSettingsService = notificationSettingsService;
    }

    @GetMapping
    public ResponseEntity<NotificationSettingDTO> getSettings() {
        return ResponseEntity.ok(notificationSettingsService.getForAdmin());
    }

    @PutMapping
    public ResponseEntity<NotificationSettingDTO> updateSettings(@RequestBody NotificationSettingDTO dto) {
        return ResponseEntity.ok(notificationSettingsService.update(dto));
    }
}
