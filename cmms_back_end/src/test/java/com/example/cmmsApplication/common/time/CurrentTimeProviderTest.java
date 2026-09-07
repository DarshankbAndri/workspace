package com.example.cmmsApplication.common.time;

import com.example.cmmsApplication.common.config.CmmsTimeProperties;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CurrentTimeProviderTest {
    private static final Instant FIXED_INSTANT = Instant.parse("2026-09-07T06:38:32.984Z");

    @AfterEach
    void restoreDefaults() {
        install("Asia/Kolkata", FIXED_INSTANT);
    }

    @Test
    void exposesOneFixedUtcClockInTheBusinessZone() {
        install("Asia/Kolkata", FIXED_INSTANT);

        assertEquals(FIXED_INSTANT, CurrentTimeProvider.now());
        assertEquals(1788763112984L, CurrentTimeProvider.epochMillis());
        assertEquals("2026-09-07T12:08:32.984+05:30", CurrentTimeProvider.businessNow().toString());
        assertEquals(LocalDate.parse("2026-09-07"), CurrentTimeProvider.today());
        assertEquals(Instant.parse("2026-09-06T18:30:00Z"),
                CurrentTimeProvider.startOfBusinessDay(LocalDate.parse("2026-09-07")));
    }

    @Test
    void daylightSavingBoundariesUseTheConfiguredIanaZone() {
        install("America/New_York", Instant.parse("2026-03-08T16:00:00Z"));

        Instant start = CurrentTimeProvider.startOfBusinessDay(LocalDate.parse("2026-03-08"));
        Instant nextStart = CurrentTimeProvider.startOfNextBusinessDay(LocalDate.parse("2026-03-08"));

        assertEquals(Instant.parse("2026-03-08T05:00:00Z"), start);
        assertEquals(Instant.parse("2026-03-09T04:00:00Z"), nextStart);
        assertEquals(23, java.time.Duration.between(start, nextStart).toHours());
    }

    @Test
    void utcZoneHasUtcBusinessBoundaries() {
        install("UTC", FIXED_INSTANT);

        assertEquals(ZoneOffset.UTC, CurrentTimeProvider.businessNow().getOffset());
        assertEquals(Instant.parse("2026-09-07T00:00:00Z"),
                CurrentTimeProvider.startOfBusinessDay(LocalDate.parse("2026-09-07")));
    }

    @Test
    void invalidIanaZoneFailsConfigurationValidation() {
        CmmsTimeProperties properties = new CmmsTimeProperties();
        properties.setBusinessZone("Not/A_Real_Zone");

        assertThrows(IllegalStateException.class, properties::validate);
    }

    private void install(String zone, Instant instant) {
        CmmsTimeProperties properties = new CmmsTimeProperties();
        properties.setBusinessZone(zone);
        properties.validate();
        new CurrentTimeProvider(Clock.fixed(instant, ZoneOffset.UTC), properties);
    }
}
