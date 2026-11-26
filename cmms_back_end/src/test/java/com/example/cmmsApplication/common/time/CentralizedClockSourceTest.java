package com.example.cmmsApplication.common.time;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CentralizedClockSourceTest {
    private static final List<String> FORBIDDEN = List.of(
            "Instant.now(",
            "LocalDateTime.now(",
            "LocalDate.now(",
            "YearMonth.now(",
            "System.currentTimeMillis(",
            "System.nanoTime("
    );

    @Test
    void applicationCodeUsesTheCentralTimeProvider() throws IOException {
        Path sourceRoot = Path.of("src", "main", "java");
        try (Stream<Path> files = Files.walk(sourceRoot)) {
            List<String> violations = files
                    .filter(path -> path.toString().endsWith(".java"))
                    .filter(path -> !path.endsWith(Path.of("common", "time", "CurrentTimeProvider.java")))
                    .flatMap(this::violations)
                    .toList();

            assertTrue(violations.isEmpty(), "Direct clock usage found: " + violations);
        }
    }

    private Stream<String> violations(Path path) {
        try {
            String source = Files.readString(path);
            return FORBIDDEN.stream()
                    .filter(source::contains)
                    .map(token -> path + " uses " + token);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to inspect " + path, exception);
        }
    }
}
