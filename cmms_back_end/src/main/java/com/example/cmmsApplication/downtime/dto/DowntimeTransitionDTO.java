package com.example.cmmsApplication.downtime.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DowntimeTransitionDTO {
    private String comment;
    private String rootCause;
    private String closureRemarks;
    private Instant downtimeEnd;
}
