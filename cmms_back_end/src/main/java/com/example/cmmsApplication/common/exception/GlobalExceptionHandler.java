package com.example.cmmsApplication.common.exception;

import com.example.cmmsApplication.common.response.ApiErrorCode;
import com.example.cmmsApplication.common.response.ApiErrorResponse;
import com.example.cmmsApplication.common.response.ApiValidationError;
import com.example.cmmsApplication.common.response.ResponseFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, ApiErrorCode.RESOURCE_NOT_FOUND, ex.getMessage(), List.of(), ex, request);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorizedAccessException(
            UnauthorizedAccessException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN, ApiErrorCode.FORBIDDEN, ex.getMessage(), List.of(), ex, request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN, ApiErrorCode.FORBIDDEN, "Access is denied.", List.of(), ex, request);
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidOperationException(
            InvalidOperationException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, ApiErrorCode.BUSINESS_RULE_VIOLATION, ex.getMessage(), List.of(), ex, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<ApiValidationError> details = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    String field = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
                    return new ApiValidationError(field, error.getDefaultMessage());
                })
                .toList();
        return buildError(HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, "Validation failed.", details, ex, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex,
            HttpServletRequest request) {
        List<ApiValidationError> details = ex.getConstraintViolations().stream()
                .map(violation -> new ApiValidationError(violation.getPropertyPath().toString(), violation.getMessage()))
                .toList();
        return buildError(HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, "Validation failed.", details, ex, request);
    }

    @ExceptionHandler({
            IllegalArgumentException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class,
            HttpRequestMethodNotSupportedException.class,
            HttpMediaTypeNotSupportedException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequestExceptions(
            Exception ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, ApiErrorCode.BAD_REQUEST, ex.getMessage(), List.of(), ex, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, ApiErrorCode.DUPLICATE_RECORD,
                "Record violates database constraints.", List.of(), ex, request);
    }

    @ExceptionHandler({MultipartException.class, MaxUploadSizeExceededException.class})
    public ResponseEntity<ApiErrorResponse> handleFileUploadException(
            Exception ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, ApiErrorCode.FILE_UPLOAD_ERROR,
                "File upload failed.", List.of(), ex, request);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoHandlerFoundException(
            NoHandlerFoundException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, ApiErrorCode.RESOURCE_NOT_FOUND,
                "Resource not found.", List.of(), ex, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGlobalException(
            Exception ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred.", List.of(), ex, request);
    }

    private ResponseEntity<ApiErrorResponse> buildError(HttpStatus status, ApiErrorCode code, String message,
                                                        List<ApiValidationError> details, Exception ex,
                                                        HttpServletRequest request) {
        logException(status, ex, request);
        return ResponseEntity.status(status)
                .body(ResponseFactory.errorBody(status, code, message, details, request));
    }

    private void logException(HttpStatus status, Exception ex, HttpServletRequest request) {
        String correlationId = ResponseFactory.correlationId(request);
        String path = ResponseFactory.path(request);
        String userId = currentUser();
        if (status.is5xxServerError()) {
            LOGGER.error("API exception correlationId={} userId={} path={} exceptionType={} message={}",
                    correlationId, userId, path, ex.getClass().getName(), ex.getMessage(), ex);
            return;
        }
        LOGGER.warn("API exception correlationId={} userId={} path={} exceptionType={} message={}",
                correlationId, userId, path, ex.getClass().getName(), ex.getMessage());
    }

    private String currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return null;
        }
        return authentication.getName();
    }
}
