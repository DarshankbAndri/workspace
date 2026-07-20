package com.example.cmmsApplication.maintenancerequest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestRelatedRecordsDTO {
    private RelatedAssignmentDTO assignment;
    private RelatedApprovalDTO approval;
    private RelatedDowntimeDTO downtime;
    private List<RelatedSpareUsageDTO> spareUsages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RelatedAssignmentDTO {
        private Long id;
        private String status;
        private String assignedTo;
        private Long assignedEmployeeId;
        private String assignedEmployeeName;
        private Long vendorId;
        private String vendorName;
        private LocalDate assignedDate;
        private LocalDate plannedEndDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RelatedApprovalDTO {
        private Long id;
        private String status;
        private String actionCode;
        private LocalDateTime requestedAt;
        private String requestedByName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RelatedDowntimeDTO {
        private Long id;
        private String status;
        private String reason;
        private Long durationMinutes;
        private LocalDateTime downtimeStart;
        private LocalDateTime downtimeEnd;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RelatedSpareUsageDTO {
        private Long id;
        private Long assignmentId;
        private Long sparePartId;
        private String partCode;
        private String partName;
        private BigDecimal requestedQty;
        private BigDecimal issuedQty;
        private String status;
        private BigDecimal totalCost;
        private LocalDateTime requestedAt;
    }
}
