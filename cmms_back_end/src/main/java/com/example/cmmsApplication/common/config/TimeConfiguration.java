package com.example.cmmsApplication.common.config;

import com.example.cmmsApplication.common.time.CurrentTimeProvider;
import com.example.cmmsApplication.common.time.UtcInstantDeserializer;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

@Configuration
public class TimeConfiguration {

    @Bean
    public Clock utcClock() {
        return Clock.systemUTC();
    }

    @Bean
    public DateTimeProvider auditingDateTimeProvider() {
        return () -> Optional.of(CurrentTimeProvider.now());
    }

    @Bean
    public Module strictUtcInstantModule() {
        SimpleModule module = new SimpleModule("strict-utc-instant-module");
        module.addDeserializer(Instant.class, new UtcInstantDeserializer());
        return module;
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer utcJacksonCustomizer() {
        return builder -> builder.featuresToDisable(
                com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS
        );
    }
}
