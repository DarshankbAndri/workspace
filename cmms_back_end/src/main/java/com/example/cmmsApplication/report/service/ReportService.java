package com.example.cmmsApplication.report.service;

import com.example.cmmsApplication.report.dto.DowntimeAnalysisPageDTO;
import com.example.cmmsApplication.report.dto.EquipmentCostReportDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;

/** Service contract for report. */
public interface ReportService {
    PageProperties getEquipmentHistory(Long equipmentId, Long siteId, Integer page, Integer size);

    DowntimeAnalysisPageDTO getDowntimeAnalysis(Long equipmentId, Long siteId, Integer page, Integer size);

    EquipmentCostReportDTO getEquipmentMaintenanceCost(Long equipmentId, Long siteId, Integer page, Integer size);

    EquipmentCostReportDTO getEquipmentCostByGroup(String groupBy, Long siteId, Integer page, Integer size);
}
