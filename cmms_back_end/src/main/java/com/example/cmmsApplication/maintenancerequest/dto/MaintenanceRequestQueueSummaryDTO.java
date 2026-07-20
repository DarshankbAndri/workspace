package com.example.cmmsApplication.maintenancerequest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestQueueSummaryDTO {
    private Long all;
    private Long pendingApproval;
    private Long open;
    private Long unassigned;
    private Long assigned;
    private Long inProgress;
    private Long overdue;
    private Long critical;
    private Long completed;
    private Long closed;
}
