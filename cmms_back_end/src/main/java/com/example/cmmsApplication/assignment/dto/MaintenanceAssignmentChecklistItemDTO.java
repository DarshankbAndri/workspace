package com.example.cmmsApplication.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceAssignmentChecklistItemDTO {
    private Long id;
    private Long assignmentId;
    private Long sourcePmChecklistItemId;
    private Integer sequenceNumber;
    @NotBlank(message = "Checklist task title is required")
    private String taskTitle;
    private String instructions;
    private Boolean required;
    private Boolean proofRequired;
    private String responseType;
    private String status;
    private String responseValue;
    private String remarks;
    private Long completedById;
    private String completedByName;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    private List<MaintenanceAssignmentChecklistProofDTO> proofs = new ArrayList<>();
}
