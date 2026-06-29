package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.security.entity.PermissionApiMapping;
import com.example.cmmsApplication.common.security.repository.PermissionApiMappingRepository;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ApiPermissionMappingCsvLoader implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiPermissionMappingCsvLoader.class);
    private static final String CSV_PATH = "api-permission-mapping.csv";

    private final PermissionApiMappingRepository repository;

    @Override
    @Transactional
    @CacheEvict(value = "api-permissions", allEntries = true)
    public void run(ApplicationArguments args) {
        ClassPathResource resource = new ClassPathResource(CSV_PATH);
        if (!resource.exists()) {
            LOGGER.warn("API permission mapping CSV not found at classpath:{}", CSV_PATH);
            return;
        }
        int inserted = 0;
        int updated = 0;
        int skipped = 0;
        int deactivated = 0;
        Set<String> loadedKeys = new HashSet<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (lineNumber == 1 || line.isBlank()) {
                    continue;
                }
                String[] columns = parseLine(line);
                if (columns.length < 4 || isBlank(columns[0]) || isBlank(columns[1]) || isBlank(columns[2])) {
                    skipped++;
                    LOGGER.warn("Skipping invalid API permission mapping CSV row lineNumber={} line={}", lineNumber, line);
                    continue;
                }
                String permissionCode = columns[0].trim().toUpperCase(Locale.ROOT);
                String apiPath = normalizePath(columns[1]);
                String httpMethod = columns[2].trim().toUpperCase(Locale.ROOT);
                String description = columns[3].trim();
                loadedKeys.add(mappingKey(permissionCode, apiPath, httpMethod));
                PermissionApiMapping mapping = repository.findByPermissionCodeAndApiPathAndHttpMethod(permissionCode, apiPath, httpMethod)
                        .orElseGet(PermissionApiMapping::new);
                boolean isNew = mapping.getId() == null;
                mapping.setPermissionCode(permissionCode);
                mapping.setApiPath(apiPath);
                mapping.setHttpMethod(httpMethod);
                mapping.setDescription(description);
                mapping.setActive(true);
                repository.save(mapping);
                if (isNew) {
                    inserted++;
                } else {
                    updated++;
                }
            }
            for (PermissionApiMapping mapping : repository.findAll()) {
                if (Boolean.TRUE.equals(mapping.getActive())
                        && !loadedKeys.contains(mappingKey(mapping.getPermissionCode(), mapping.getApiPath(), mapping.getHttpMethod()))) {
                    mapping.setActive(false);
                    repository.save(mapping);
                    deactivated++;
                }
            }
        } catch (Exception ex) {
            LOGGER.error("Unable to load API permission mapping CSV", ex);
        }
        LOGGER.info("API permission mapping CSV loaded inserted={} updated={} deactivated={} skipped={}",
                inserted, updated, deactivated, skipped);
    }

    private String[] parseLine(String line) {
        return line.split(",", 4);
    }

    private String normalizePath(String value) {
        String path = value.trim();
        return path.startsWith("/") ? path : "/" + path;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String mappingKey(String permissionCode, String apiPath, String httpMethod) {
        return permissionCode + "|" + apiPath + "|" + httpMethod;
    }
}
