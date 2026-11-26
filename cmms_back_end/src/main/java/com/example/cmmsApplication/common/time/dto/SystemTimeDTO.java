package com.example.cmmsApplication.common.time.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemTimeDTO {
    private Instant serverInstant;
    private long epochMillis;
    private LocalDate businessDate;
    private OffsetDateTime businessDateTime;
    private String timeZone;
    private String utcOffset;
    private String locale;
}
