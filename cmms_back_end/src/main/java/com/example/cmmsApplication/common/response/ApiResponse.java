package com.example.cmmsApplication.common.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;

public class ApiResponse<T> {
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timestamp;
    private int status;
    private boolean success;
    private String code;
    private String message;
    private T data;
    private String path;
    private String correlationId;

    public ApiResponse() {
    }

    public ApiResponse(Instant timestamp, int status, boolean success, String code, String message,
                       T data, String path, String correlationId) {
        this.timestamp = timestamp;
        this.status = status;
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
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

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
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
