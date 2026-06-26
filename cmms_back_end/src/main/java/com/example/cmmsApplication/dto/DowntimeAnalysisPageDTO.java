package com.example.cmmsApplication.dto;

public class DowntimeAnalysisPageDTO {
    private PageProperties page;
    private DowntimeAnalysisSummaryDTO summary;

    public DowntimeAnalysisPageDTO(PageProperties page, DowntimeAnalysisSummaryDTO summary) {
        this.page = page;
        this.summary = summary;
    }

    public PageProperties getPage() { return page; }
    public void setPage(PageProperties page) { this.page = page; }
    public DowntimeAnalysisSummaryDTO getSummary() { return summary; }
    public void setSummary(DowntimeAnalysisSummaryDTO summary) { this.summary = summary; }
}
