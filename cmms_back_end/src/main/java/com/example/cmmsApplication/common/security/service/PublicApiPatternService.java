package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublicApiPatternService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PublicApiPatternService.class);

    private final CmmsSecurityProperties securityProperties;
    private final ResourceLoader resourceLoader;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private List<String> patterns = List.of();

    @PostConstruct
    public void loadPatterns() {
        patterns = List.copyOf(readPatterns());
        LOGGER.info("CMMS public API patterns loaded from {}: {}",
                securityProperties.getPublicApiPatternsXml(), patterns);
    }

    public List<String> getPatterns() {
        return patterns;
    }

    public String[] getSecurityMatcherPatterns() {
        Set<String> matchers = new LinkedHashSet<>();
        for (String pattern : patterns) {
            matchers.add(normalizePath(pattern));
            if (pattern.startsWith("/api/")) {
                matchers.add(normalizePath(pattern.substring("/api".length())));
            }
        }
        return matchers.toArray(String[]::new);
    }

    public boolean isPublicApi(String requestUrl) {
        String path = normalizePath(requestUrl);
        return patterns.stream()
                .map(this::normalizePath)
                .anyMatch((pattern) -> pathMatcher.match(pattern, path));
    }

    private List<String> readPatterns() {
        Resource resource = resourceLoader.getResource(securityProperties.getPublicApiPatternsXml());
        if (!resource.exists()) {
            throw new IllegalStateException("Public API patterns XML not found: "
                    + securityProperties.getPublicApiPatternsXml());
        }

        try (InputStream inputStream = resource.getInputStream()) {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            Document document = factory.newDocumentBuilder().parse(inputStream);
            NodeList nodes = document.getElementsByTagName("pattern");
            List<String> loadedPatterns = new ArrayList<>();
            for (int i = 0; i < nodes.getLength(); i++) {
                String value = nodes.item(i).getTextContent();
                if (value != null && !value.isBlank()) {
                    loadedPatterns.add(normalizePath(value));
                }
            }
            if (loadedPatterns.isEmpty()) {
                throw new IllegalStateException("Public API patterns XML has no <pattern> entries: "
                        + securityProperties.getPublicApiPatternsXml());
            }
            return loadedPatterns;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read public API patterns XML: "
                    + securityProperties.getPublicApiPatternsXml(), ex);
        }
    }

    private String normalizePath(String value) {
        if (value == null || value.isBlank()) {
            return "/";
        }
        String normalized = value.trim().replace('\\', '/');
        return normalized.startsWith("/") ? normalized : "/" + normalized;
    }
}
