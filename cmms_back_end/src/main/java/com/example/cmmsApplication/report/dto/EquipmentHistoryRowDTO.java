package com.example.cmmsApplication.report.dto;


import lombok.NoArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
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

}
