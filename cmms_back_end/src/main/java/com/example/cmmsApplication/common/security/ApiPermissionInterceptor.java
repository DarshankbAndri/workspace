package com.example.cmmsApplication.common.security;

import com.example.cmmsApplication.common.response.ApiErrorCode;
import com.example.cmmsApplication.common.response.ApiErrorResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.common.security.service.ApiPermissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

@Component
@RequiredArgsConstructor
public class ApiPermissionInterceptor implements HandlerInterceptor {
    private final ApiPermissionService apiPermissionService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!requiresPermissionCheck(request)) {
            return true;
        }

        Object userId = request.getAttribute(JwtFilter.AUTHENTICATED_USER_ID_ATTRIBUTE);
        if (!(userId instanceof String userIdText) || userIdText.isBlank()) {
            return true;
        }

        String permissionPath = resolvePermissionPath(request);
        boolean allowed;
        try {
            allowed = apiPermissionService.hasPermission(userIdText, permissionPath, request.getMethod());
        } catch (Exception ex) {
            allowed = false;
        }

        if (allowed) {
            return true;
        }

        SecurityContextHolder.clearContext();
        writeError(response, request);
        return false;
    }

    private boolean requiresPermissionCheck(HttpServletRequest request) {
        return !"OPTIONS".equalsIgnoreCase(request.getMethod())
                && !apiPermissionService.isPublicApi(request.getRequestURI());
    }

    private String resolvePermissionPath(HttpServletRequest request) {
        Object matchingPattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        if (!(matchingPattern instanceof String pattern) || pattern.isBlank()) {
            return request.getRequestURI();
        }

        String contextPath = request.getContextPath();
        String normalizedPattern = pattern.replace('\\', '/');
        if (!normalizedPattern.startsWith("/")) {
            normalizedPattern = "/" + normalizedPattern;
        }
        if (contextPath != null && !contextPath.isBlank() && !normalizedPattern.startsWith(contextPath + "/")) {
            normalizedPattern = contextPath + normalizedPattern;
        }
        return normalizedPattern;
    }

    private void writeError(HttpServletResponse response, HttpServletRequest request) throws IOException {
        ApiErrorResponse errorResponse = ResponseFactory.errorBody(
                HttpStatus.FORBIDDEN,
                ApiErrorCode.API_PERMISSION_DENIED,
                "You do not have permission to access this API.",
                List.of(),
                request);
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
