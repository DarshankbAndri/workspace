package com.example.cmmsApplication.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidgetDefinitionDTO {
    private String code;
    private String department;
    private String title;
    private String type;
    private String apiPath;
    private Integer refreshSeconds;
    private String targetPath;
    private String size;
    private List<String> requiredPermissions;
    private List<String> anyOfPermissions;
    private List<String> actionPermissions;
    private List<DashboardActionDTO> actions;
}
