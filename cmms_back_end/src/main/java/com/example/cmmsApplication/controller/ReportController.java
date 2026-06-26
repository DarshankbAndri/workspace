package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.DowntimeAnalysisPageDTO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.service.ReportService;
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
    public ResponseEntity<PageProperties> getEquipmentHistory(@RequestParam(required = false) Long equipmentId,
                                                              @RequestParam(required = false) Long siteId,
                                                              @RequestParam(required = false) Integer page,
                                                              @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(reportService.getEquipmentHistory(equipmentId, siteId, page, size));
    }

    @GetMapping("/downtime-analysis")
    public ResponseEntity<DowntimeAnalysisPageDTO> getDowntimeAnalysis(@RequestParam(required = false) Long equipmentId,
                                                                       @RequestParam(required = false) Long siteId,
                                                                       @RequestParam(required = false) Integer page,
                                                                       @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(reportService.getDowntimeAnalysis(equipmentId, siteId, page, size));
    }
}
