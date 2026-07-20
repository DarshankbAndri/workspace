package com.example.cmmsApplication.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardActionDTO {
    private String code;
    private String label;
    private String targetPath;
    private String permissionCode;
}
