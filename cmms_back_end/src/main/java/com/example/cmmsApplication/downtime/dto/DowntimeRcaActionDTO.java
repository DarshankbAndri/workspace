package com.example.cmmsApplication.downtime.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DowntimeRcaActionDTO {
    private Long id;
    private Long downtimeId;
    private String actionType;
    @NotBlank(message = "Action description is required")
    private String description;
    private Long responsibleEmployeeId;
    private String responsibleEmployeeName;
    private LocalDate targetDate;
    private String status;
    private Instant completedAt;
    private Long verifiedByUserId;
    private String verifiedByName;
    private Instant verifiedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
