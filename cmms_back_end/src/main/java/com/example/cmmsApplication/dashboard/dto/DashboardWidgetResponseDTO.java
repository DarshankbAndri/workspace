package com.example.cmmsApplication.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidgetResponseDTO {
    private String widgetCode;
    private String department;
    private String type;
    private String title;
    private Object data;
    private String severity;
    private String targetPath;
    private List<String> actionPermissions;
    private List<DashboardActionDTO> actions;
    private Integer refreshSeconds;
    private LocalDateTime generatedAt;
}
