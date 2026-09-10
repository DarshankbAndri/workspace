package com.example.cmmsApplication.common.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Locale;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cmms.time")
public class CmmsTimeProperties {
    private String businessZone = "Asia/Kolkata";
    private String locale = "en-IN";

    @PostConstruct
    public void validate() {
        try {
            ZoneId.of(businessZone);
        } catch (DateTimeException exception) {
            throw new IllegalStateException("cmms.time.business-zone must be a valid IANA timezone: " + businessZone,
                    exception);
        }

        if (locale == null || locale.isBlank() || Locale.forLanguageTag(locale).getLanguage().isBlank()) {
            throw new IllegalStateException("cmms.time.locale must be a valid BCP 47 language tag");
        }
    }

    public ZoneId businessZoneId() {
        return ZoneId.of(businessZone);
    }
}
