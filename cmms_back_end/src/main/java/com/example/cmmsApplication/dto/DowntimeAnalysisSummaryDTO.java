package com.example.cmmsApplication.dto;

import java.math.BigDecimal;

public class DowntimeAnalysisSummaryDTO {
    private Long events;
    private Long plannedEvents;
    private Long unplannedEvents;
    private Long totalMinutes;
    private BigDecimal totalHours;
    private BigDecimal totalDays;

    public Long getEvents() { return events; }
    public void setEvents(Long events) { this.events = events; }
    public Long getPlannedEvents() { return plannedEvents; }
    public void setPlannedEvents(Long plannedEvents) { this.plannedEvents = plannedEvents; }
    public Long getUnplannedEvents() { return unplannedEvents; }
    public void setUnplannedEvents(Long unplannedEvents) { this.unplannedEvents = unplannedEvents; }
    public Long getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(Long totalMinutes) { this.totalMinutes = totalMinutes; }
    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
    public BigDecimal getTotalDays() { return totalDays; }
    public void setTotalDays(BigDecimal totalDays) { this.totalDays = totalDays; }
}
