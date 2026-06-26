package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.DashboardDTO;
import com.example.cmmsApplication.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO> getSummary(@RequestParam(required = false) Long siteId) {
        return ResponseEntity.ok(dashboardService.getSummary(siteId));
    }
}
