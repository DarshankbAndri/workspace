package com.example.cmmsApplication.preventivemaintenance.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.preventivemaintenance.service.PreventiveMaintenanceScheduleService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/preventive-maintenance/calendar")
@RequiredArgsConstructor
public class PreventiveMaintenanceCalendarController {
    private final PreventiveMaintenanceScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Long equipmentId) {
        return ResponseFactory.ok(scheduleService.getCalendar(startDate, endDate, siteId, equipmentId));
    }
}
