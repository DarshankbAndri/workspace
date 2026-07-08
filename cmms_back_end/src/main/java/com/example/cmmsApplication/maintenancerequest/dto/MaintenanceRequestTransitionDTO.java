package com.example.cmmsApplication.maintenancerequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequestTransitionDTO {
    @NotBlank(message = "Transition action is required")
    private String action;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
