package com.example.cmmsApplication.assignment.dto;


import com.example.cmmsApplication.vendor.entity.Vendor;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceAssignmentDTO {
    private Long id;
    private Long siteId;
    private String siteCode;
    private String siteName;
    @NotNull(message = "Maintenance request is required")
    private Long requestId;
    private String requestNumber;
    private String requestTitle;
    private String requestStatus;
    private String requestPriority;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    @NotNull(message = "Vendor is required")
    private Long vendorId;
    private String vendorName;
    private Long assignedEmployeeId;
    private String assignedEmployeeCode;
    private String assignedEmployeeName;
    private String assignedTo;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate assignedDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate plannedStartDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate plannedEndDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate actualStartDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate actualEndDate;
    private String status;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    
}
