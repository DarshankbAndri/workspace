package com.example.cmmsApplication.assignment.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    private String workNotes;
    private String issueFound;
    private String actionTaken;
    private String completionStatus;
    private Long createdById;
    private String createdByName;
    private Long updatedById;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    private List<MaintenanceAssignmentWorkLogAttachmentDTO> attachments = new ArrayList<>();
}
