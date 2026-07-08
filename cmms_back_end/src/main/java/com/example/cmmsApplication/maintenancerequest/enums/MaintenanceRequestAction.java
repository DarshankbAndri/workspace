package com.example.cmmsApplication.maintenancerequest.enums;

import com.example.cmmsApplication.common.exception.InvalidOperationException;

import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

public enum MaintenanceRequestAction {
    ASSIGN,
    START,
    HOLD,
    RESUME,
    COMPLETE,
    REQUEST_CLOSE,
    CANCEL,
    REOPEN;

    public static MaintenanceRequestAction from(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidOperationException("Request transition action is required");
        }
        try {
            return MaintenanceRequestAction.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new InvalidOperationException("Request transition action must be one of: " + allowedValues());
        }
    }

    private static String allowedValues() {
        return Arrays.stream(values()).map(Enum::name).collect(Collectors.joining(", "));
    }
}
