package com.example.cmmsApplication.preventivemaintenance.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PmScheduleChecklistItemDTO {
    private Long id;
    private Integer sequenceNumber;
    @NotBlank(message = "Checklist task title is required")
    private String taskTitle;
    private String instructions;
    private Boolean required;
    private Boolean proofRequired;
    private String responseType;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
