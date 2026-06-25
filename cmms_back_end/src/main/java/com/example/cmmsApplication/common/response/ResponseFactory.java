package com.example.cmmsApplication.common.response;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.List;

public final class ResponseFactory {
    private static final String DEFAULT_SUCCESS_MESSAGE = "Operation completed successfully.";

    private ResponseFactory() {
    }

    public static <T> ResponseEntity<ApiResponse<?>> ok(T data) {
        return success(HttpStatus.OK, data, DEFAULT_SUCCESS_MESSAGE);
    }

    public static <T> ResponseEntity<ApiResponse<?>> ok(T data, String message) {
        return success(HttpStatus.OK, data, message);
    }

    public static <T> ResponseEntity<ApiResponse<?>> created(T data) {
        return success(HttpStatus.CREATED, data, "Resource created successfully.");
    }

    public static <T> ResponseEntity<ApiResponse<?>> success(HttpStatus status, T data, String message) {
        HttpServletRequest request = currentRequest();
        ApiResponse<T> response = new ApiResponse<>(
                Instant.now(),
                status.value(),
                true,
                ApiErrorCode.SUCCESS.name(),
                message,
                data,
                path(request),
                correlationId(request)
        );
        return ResponseEntity.status(status).body(response);
    }

    public static ResponseEntity<ApiErrorResponse> error(HttpStatus status, ApiErrorCode code, String message) {
        return error(status, code, message, List.of());
    }

    public static ResponseEntity<ApiErrorResponse> error(HttpStatus status, ApiErrorCode code, String message,
                                                         List<ApiValidationError> details) {
        return ResponseEntity.status(status).body(errorBody(status, code, message, details, currentRequest()));
    }

    public static ApiErrorResponse errorBody(HttpStatus status, ApiErrorCode code, String message,
                                             List<ApiValidationError> details, HttpServletRequest request) {
        return new ApiErrorResponse(
                Instant.now(),
                status.value(),
                false,
                code.name(),
                message,
                details,
                path(request),
                correlationId(request)
        );
    }

    public static String path(HttpServletRequest request) {
        return request == null ? "" : request.getRequestURI();
    }

    public static String correlationId(HttpServletRequest request) {
        Object requestValue = request == null ? null : request.getAttribute(CorrelationIdFilter.CORRELATION_ID_ATTRIBUTE);
        return requestValue == null ? "" : requestValue.toString();
    }

    private static HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }
}
