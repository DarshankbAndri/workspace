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
public class DashboardDepartmentDTO {
    private String code;
    private String label;
    private List<DashboardWidgetDefinitionDTO> widgets;
}
