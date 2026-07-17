package com.example.cmmsApplication.vendoramc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorAmcPmScheduleDTO {
    private Long id;
    private String scheduleCode;
    private String siteName;
    private String equipmentCode;
    private String equipmentName;
    private String title;
    private String frequency;
    private String priority;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextDueDate;
    private Boolean active;
    private String status;
}
