package com.example.cmmsApplication.common.time;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UtcInstantDeserializerTest {
    private final ObjectMapper objectMapper = objectMapper();

    @Test
    void acceptsOnlyUtcIsoInstantValues() throws Exception {
        assertEquals(Instant.parse("2026-09-07T06:38:32.984Z"),
                objectMapper.readValue("\"2026-09-07T06:38:32.984Z\"", Instant.class));
    }

    @Test
    void rejectsTimezoneLessAndNonUtcOffsets() {
        assertThrows(Exception.class,
                () -> objectMapper.readValue("\"2026-09-07T12:08:32.984\"", Instant.class));
        assertThrows(Exception.class,
                () -> objectMapper.readValue("\"2026-09-07T12:08:32.984+05:30\"", Instant.class));
    }

    private ObjectMapper objectMapper() {
        SimpleModule module = new SimpleModule();
        module.addDeserializer(Instant.class, new UtcInstantDeserializer());
        return new ObjectMapper().registerModule(module);
    }
}
