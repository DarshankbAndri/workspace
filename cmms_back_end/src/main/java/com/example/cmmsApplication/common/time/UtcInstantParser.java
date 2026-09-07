package com.example.cmmsApplication.common.time;

import java.time.Instant;
import java.time.format.DateTimeParseException;

public final class UtcInstantParser {
    private UtcInstantParser() {
    }

    public static Instant parse(String value) {
        if (value == null || value.isBlank() || !value.endsWith("Z")) {
            throw new IllegalArgumentException("Timestamp must be an ISO-8601 UTC value ending in Z");
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Timestamp must be an ISO-8601 UTC value ending in Z", exception);
        }
    }
}
