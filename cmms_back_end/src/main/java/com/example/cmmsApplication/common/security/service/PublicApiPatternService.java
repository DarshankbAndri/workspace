package com.example.cmmsApplication.common.security.service;

import java.util.List;

/** Service contract for public api pattern. */
public interface PublicApiPatternService {
    void loadPatterns();

    List<String> getPatterns();

    String[] getSecurityMatcherPatterns();

    boolean isPublicApi(String requestUrl);
}
