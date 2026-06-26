package com.example.cmmsApplication.common.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ApiErrorResponse {
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timestamp;
    private int status;
    private boolean success;
    private String code;
    private String message;
    private List<ApiValidationError> details = new ArrayList<>();
    private String path;
    private String correlationId;

    public ApiErrorResponse() {
    }

    public ApiErrorResponse(Instant timestamp, int status, boolean success, String code, String message,
                            List<ApiValidationError> details, String path, String correlationId) {
        this.timestamp = timestamp;
        this.status = status;
        this.success = success;
        this.code = code;
        this.message = message;
        this.details = details == null ? new ArrayList<>() : details;
        this.path = path;
        this.correlationId = correlationId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ApiValidationError> getDetails() {
        return details;
    }

    public void setDetails(List<ApiValidationError> details) {
        this.details = details == null ? new ArrayList<>() : details;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
}
