package com.example.cmmsApplication.preventivemaintenance.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.site.entity.Site;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreventiveMaintenanceScheduleDTO {
    private Long id;
    private String scheduleCode;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteCode;
    private String siteName;
    @NotNull(message = "Equipment is required")
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long vendorId;
    private String vendorName;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    @NotBlank(message = "Frequency is required")
    private String frequency;
    private String priority;
    private String assignedTo;
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextDueDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastGeneratedDate;
    private Boolean active;
    private String status;
    private String lastNotificationStatus;
    private LocalDateTime lastNotificationAt;
    private long generatedWorkOrders;
    private long completedWorkOrders;
    private BigDecimal completionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long approvalRequestId;
    private String approvalStatus;
    private List<PmScheduleChecklistItemDTO> checklistItems = new ArrayList<>();

}
