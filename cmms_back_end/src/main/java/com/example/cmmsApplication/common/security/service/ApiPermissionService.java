package com.example.cmmsApplication.common.security.service;

/** Service contract for api permission. */
public interface ApiPermissionService {
    boolean hasPermission(String userId, String requestUrl, String httpMethod);

    boolean hasPermission(Long userId, String requestUrl, String httpMethod);

    boolean isPublicApi(String requestUrl);
}
