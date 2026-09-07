package com.example.cmmsApplication.assignment.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceAssignmentWorkLogDTO {
    private Long id;
    private Long assignmentId;
    @NotNull(message = "Technician is required")
    private Long technicianEmployeeId;
    private String technicianEmployeeCode;
    private String technicianName;
    @NotNull(message = "Start time is required")
    private Instant startTime;
    private Instant endTime;
    private String workNotes;
    private String issueFound;
    private String actionTaken;
    private String completionStatus;
    private Long createdById;
    private String createdByName;
    private Long updatedById;
    private String updatedByName;
    private Instant createdAt;
    private Instant updatedAt;
    @Builder.Default
    private List<MaintenanceAssignmentWorkLogAttachmentDTO> attachments = new ArrayList<>();
}
