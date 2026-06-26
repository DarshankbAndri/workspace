package com.example.cmmsApplication.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EquipmentDowntimeDTO {
    private Long id;
    @NotNull(message = "Equipment is required")
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteCode;
    private String siteName;
    private Long requestId;
    private String requestNumber;
    private String requestTitle;
    @NotNull(message = "Downtime start is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime downtimeStart;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime downtimeEnd;
    private Long downtimeMinutes;
    private BigDecimal downtimeHours;
    private BigDecimal downtimeDays;
    @NotBlank(message = "Reason is required")
    private String reason;
    private Boolean planned;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }
    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }
    public String getRequestTitle() { return requestTitle; }
    public void setRequestTitle(String requestTitle) { this.requestTitle = requestTitle; }
    public LocalDateTime getDowntimeStart() { return downtimeStart; }
    public void setDowntimeStart(LocalDateTime downtimeStart) { this.downtimeStart = downtimeStart; }
    public LocalDateTime getDowntimeEnd() { return downtimeEnd; }
    public void setDowntimeEnd(LocalDateTime downtimeEnd) { this.downtimeEnd = downtimeEnd; }
    public Long getDowntimeMinutes() { return downtimeMinutes; }
    public void setDowntimeMinutes(Long downtimeMinutes) { this.downtimeMinutes = downtimeMinutes; }
    public BigDecimal getDowntimeHours() { return downtimeHours; }
    public void setDowntimeHours(BigDecimal downtimeHours) { this.downtimeHours = downtimeHours; }
    public BigDecimal getDowntimeDays() { return downtimeDays; }
    public void setDowntimeDays(BigDecimal downtimeDays) { this.downtimeDays = downtimeDays; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Boolean getPlanned() { return planned; }
    public void setPlanned(Boolean planned) { this.planned = planned; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
