package com.example.cmmsApplication.downtime.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DowntimeStatusHistoryDTO {
    private Long id;
    private Long downtimeId;
    private String fromStatus;
    private String toStatus;
    private String action;
    private String comment;
    private Long changedByUserId;
    private String changedByName;
    private LocalDateTime changedAt;
}
