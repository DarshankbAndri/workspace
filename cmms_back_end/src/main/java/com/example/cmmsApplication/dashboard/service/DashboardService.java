package com.example.cmmsApplication.dashboard.service;

import com.example.cmmsApplication.dashboard.dto.DashboardDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardMeDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardOverviewDTO;
import com.example.cmmsApplication.dashboard.dto.DashboardWidgetResponseDTO;

/** Service contract for dashboard. */
public interface DashboardService {
    DashboardDTO getSummary(Long siteId);

    DashboardOverviewDTO getOverview(Long siteId);

    DashboardMeDTO getDashboardMetadata();

    DashboardWidgetResponseDTO getKpiSummaryWidget(Long siteId);

    DashboardWidgetResponseDTO getEquipmentStatusWidget(Long siteId);

    DashboardWidgetResponseDTO getDowntimeSummaryWidget(Long siteId);

    DashboardWidgetResponseDTO getVendorPerformanceWidget(Long siteId);

    DashboardWidgetResponseDTO getPmDueWidget(Long siteId);

    DashboardWidgetResponseDTO getOpenRequestsWidget(Long siteId);

    DashboardWidgetResponseDTO getAssignmentQueueWidget(Long siteId);

    DashboardWidgetResponseDTO getTechnicianMyJobsWidget(Long siteId);

    DashboardWidgetResponseDTO getLowStockWidget(Long siteId);

    DashboardWidgetResponseDTO getReorderQueueWidget(Long siteId);

    DashboardWidgetResponseDTO getActiveAmcContractsWidget(Long siteId);
}
