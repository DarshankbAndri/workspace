package com.example.cmmsApplication.dto;

import java.time.LocalDateTime;

public class EquipmentHistoryRowDTO {
    private String id;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long siteId;
    private String siteCode;
    private String siteName;
    private String type;
    private String reference;
    private String detail;
    private String status;
    private LocalDateTime date;

    public EquipmentHistoryRowDTO() {
    }

    public EquipmentHistoryRowDTO(String id, Long equipmentId, String equipmentCode, String equipmentName,
                                  Long siteId, String siteCode, String siteName, String type,
                                  String reference, String detail, String status, LocalDateTime date) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.siteId = siteId;
        this.siteCode = siteCode;
        this.siteName = siteName;
        this.type = type;
        this.reference = reference;
        this.detail = detail;
        this.status = status;
        this.date = date;
    }

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
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
}
