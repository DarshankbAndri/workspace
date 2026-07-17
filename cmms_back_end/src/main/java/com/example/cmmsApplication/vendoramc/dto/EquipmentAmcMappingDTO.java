package com.example.cmmsApplication.vendoramc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentAmcMappingDTO {
    private Long id;
    private Long amcContractId;
    @NotNull(message = "Equipment is required")
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long siteId;
    private String siteName;
    private String coverageType;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate coverageStartDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate coverageEndDate;
    private String remarks;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
