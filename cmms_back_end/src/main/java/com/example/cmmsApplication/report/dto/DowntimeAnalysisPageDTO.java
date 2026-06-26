package com.example.cmmsApplication.report.dto;


import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.common.search.dto.PageProperties;
@Data
@NoArgsConstructor
public class DowntimeAnalysisPageDTO {
    private PageProperties page;
    private DowntimeAnalysisSummaryDTO summary;

    public DowntimeAnalysisPageDTO(PageProperties page, DowntimeAnalysisSummaryDTO summary) {
        this.page = page;
        this.summary = summary;
    }

}
