package com.example.cmmsApplication.dto;

import java.math.BigDecimal;

public class DowntimeAnalysisRowDTO {
    private String id;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private Long events;
    private Long plannedEvents;
    private Long unplannedEvents;
    private Long totalMinutes;
    private BigDecimal totalHours;
    private BigDecimal totalDays;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }
    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
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
