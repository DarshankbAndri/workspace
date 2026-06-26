package com.example.cmmsApplication.report.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.report.dto.DowntimeAnalysisPageDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/equipment-history")
    public ResponseEntity<ApiResponse<?>> getEquipmentHistory(@RequestParam(required = false) Long equipmentId,
                                                              @RequestParam(required = false) Long siteId,
                                                              @RequestParam(required = false) Integer page,
                                                              @RequestParam(required = false) Integer size) {
        return ResponseFactory.ok(reportService.getEquipmentHistory(equipmentId, siteId, page, size));
    }

    @GetMapping("/downtime-analysis")
    public ResponseEntity<ApiResponse<?>> getDowntimeAnalysis(@RequestParam(required = false) Long equipmentId,
                                                                       @RequestParam(required = false) Long siteId,
                                                                       @RequestParam(required = false) Integer page,
                                                                       @RequestParam(required = false) Integer size) {
        return ResponseFactory.ok(reportService.getDowntimeAnalysis(equipmentId, siteId, page, size));
    }
}





