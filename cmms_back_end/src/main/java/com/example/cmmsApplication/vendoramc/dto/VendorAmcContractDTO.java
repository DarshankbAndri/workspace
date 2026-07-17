package com.example.cmmsApplication.vendoramc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorAmcContractDTO {
    private Long id;
    @NotNull(message = "Vendor is required")
    private Long vendorId;
    private String vendorName;
    @NotBlank(message = "Contract number is required")
    private String contractNumber;
    @NotBlank(message = "Contract name is required")
    private String contractName;
    private String contractType;
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @NotNull(message = "End date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    private BigDecimal contractValue;
    private String coverageDescription;
    private Integer responseTimeHours;
    private Integer resolutionTimeHours;
    private Boolean includesLabor;
    private Boolean includesSpares;
    private String status;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private String remarks;
    private Long renewedFromContractId;
    private Integer coveredEquipmentCount;
    private Long daysRemaining;
    @Builder.Default
    private List<EquipmentAmcMappingDTO> equipmentMappings = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
