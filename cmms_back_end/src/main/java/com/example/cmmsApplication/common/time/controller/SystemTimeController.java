package com.example.cmmsApplication.common.time.controller;

import com.example.cmmsApplication.common.config.CmmsTimeProperties;
import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;
import com.example.cmmsApplication.common.time.dto.SystemTimeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequiredArgsConstructor
@RequestMapping("/system")
public class SystemTimeController {
    private final CmmsTimeProperties timeProperties;

    @GetMapping("/time")
    public ResponseEntity<ApiResponse<?>> currentTime() {
        Instant serverInstant = CurrentTimeProvider.now();
        var businessNow = CurrentTimeProvider.inBusinessZone(serverInstant);
        var response = ResponseFactory.ok(SystemTimeDTO.builder()
                .serverInstant(serverInstant)
                .epochMillis(CurrentTimeProvider.epochMillis(serverInstant))
                .businessDate(businessNow.toLocalDate())
                .businessDateTime(businessNow)
                .timeZone(CurrentTimeProvider.businessZone().getId())
                .utcOffset(businessNow.getOffset().getId())
                .locale(timeProperties.getLocale())
                .build());
        return ResponseEntity.status(response.getStatusCode())
                .cacheControl(CacheControl.noStore())
                .body(response.getBody());
    }
}
