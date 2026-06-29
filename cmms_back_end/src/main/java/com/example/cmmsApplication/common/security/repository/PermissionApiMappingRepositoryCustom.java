package com.example.cmmsApplication.common.security.repository;

public interface PermissionApiMappingRepositoryCustom {
    boolean hasPermission(String userId, String requestUrl, String httpMethod);
    boolean hasActiveMapping(String requestUrl, String httpMethod);
}
