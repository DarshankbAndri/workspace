package com.example.cmmsApplication.common.time;

import com.example.cmmsApplication.common.config.CmmsTimeProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Component
public class CurrentTimeProvider {
    private static volatile Clock utcClock = Clock.systemUTC();
    private static volatile ZoneId businessZone = ZoneId.of("Asia/Kolkata");

    public CurrentTimeProvider(Clock clock, CmmsTimeProperties properties) {
        utcClock = clock.withZone(ZoneId.of("UTC"));
        businessZone = properties.businessZoneId();
    }

    public static Instant now() {
        return utcClock.instant();
    }

    public static long epochMillis() {
        return now().toEpochMilli();
    }

    public static long epochMillis(Instant instant) {
        return instant.toEpochMilli();
    }

    public static LocalDate today() {
        return LocalDate.now(utcClock.withZone(businessZone));
    }

    public static OffsetDateTime businessNow() {
        return inBusinessZone(now());
    }

    public static OffsetDateTime inBusinessZone(Instant instant) {
        return instant.atZone(businessZone).toOffsetDateTime();
    }

    public static Instant startOfBusinessDay(LocalDate date) {
        return date.atStartOfDay(businessZone).toInstant();
    }

    public static Instant startOfNextBusinessDay(LocalDate date) {
        return date.plusDays(1).atStartOfDay(businessZone).toInstant();
    }

    public static ZoneId businessZone() {
        return businessZone;
    }

    public static long monotonicNanos() {
        return System.nanoTime();
    }

    public static Duration elapsedSince(long startedNanos) {
        return Duration.ofNanos(Math.max(0L, System.nanoTime() - startedNanos));
    }
}
