package com.example.cmmsApplication.dashboard.dto;

import com.example.cmmsApplication.common.security.dto.AllowedSiteDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMeDTO {
    private String defaultDepartment;
    private Set<String> permissions;
    private List<AllowedSiteDTO> allowedSites;
    private List<DashboardDepartmentDTO> departments;
    private List<DashboardActionDTO> quickActions;
    private LocalDateTime generatedAt;
    private Integer refreshAfterSeconds;
}
