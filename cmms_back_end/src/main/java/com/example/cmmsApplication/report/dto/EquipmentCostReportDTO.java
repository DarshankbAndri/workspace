package com.example.cmmsApplication.report.dto;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCostReportDTO {
    private PageProperties page;
    private EquipmentCostSummaryDTO summary;
}
