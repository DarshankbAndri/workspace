package com.example.cmmsApplication.dashboard.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<?>> getSummary(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getSummary(siteId));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<?>> getOverview(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getOverview(siteId));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getDashboardMetadata() {
        return ResponseFactory.ok(dashboardService.getDashboardMetadata());
    }

    @GetMapping("/widgets/overview/kpi-summary")
    public ResponseEntity<ApiResponse<?>> getKpiSummaryWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getKpiSummaryWidget(siteId));
    }

    @GetMapping("/widgets/equipment/status")
    public ResponseEntity<ApiResponse<?>> getEquipmentStatusWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getEquipmentStatusWidget(siteId));
    }

    @GetMapping("/widgets/reports/downtime-summary")
    public ResponseEntity<ApiResponse<?>> getDowntimeSummaryWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getDowntimeSummaryWidget(siteId));
    }

    @GetMapping("/widgets/vendor-amc/performance")
    public ResponseEntity<ApiResponse<?>> getVendorPerformanceWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getVendorPerformanceWidget(siteId));
    }

    @GetMapping("/widgets/maintenance/pm-due")
    public ResponseEntity<ApiResponse<?>> getPmDueWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getPmDueWidget(siteId));
    }

    @GetMapping("/widgets/maintenance/open-requests")
    public ResponseEntity<ApiResponse<?>> getOpenRequestsWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getOpenRequestsWidget(siteId));
    }

    @GetMapping("/widgets/maintenance/assignment-queue")
    public ResponseEntity<ApiResponse<?>> getAssignmentQueueWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getAssignmentQueueWidget(siteId));
    }

    @GetMapping("/widgets/technician/my-jobs")
    public ResponseEntity<ApiResponse<?>> getTechnicianMyJobsWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getTechnicianMyJobsWidget(siteId));
    }

    @GetMapping("/widgets/inventory/low-stock")
    public ResponseEntity<ApiResponse<?>> getLowStockWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getLowStockWidget(siteId));
    }

    @GetMapping("/widgets/inventory/reorder-queue")
    public ResponseEntity<ApiResponse<?>> getReorderQueueWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getReorderQueueWidget(siteId));
    }

    @GetMapping("/widgets/vendor-amc/active-contracts")
    public ResponseEntity<ApiResponse<?>> getActiveAmcContractsWidget(@RequestParam(required = false) Long siteId) {
        return ResponseFactory.ok(dashboardService.getActiveAmcContractsWidget(siteId));
    }
}
