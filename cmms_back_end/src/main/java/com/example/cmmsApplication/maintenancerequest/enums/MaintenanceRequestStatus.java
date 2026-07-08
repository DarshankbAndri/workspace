package com.example.cmmsApplication.maintenancerequest.enums;

import com.example.cmmsApplication.common.exception.InvalidOperationException;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public enum MaintenanceRequestStatus {
    OPEN,
    ASSIGNED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CLOSED,
    CANCELLED,
    PENDING_APPROVAL,
    CLOSE_PENDING_APPROVAL,
    REJECTED;

    private static final Set<MaintenanceRequestStatus> WORK_BLOCKING_STATUSES = Set.of(
            PENDING_APPROVAL,
            CLOSE_PENDING_APPROVAL,
            REJECTED,
            CLOSED,
            CANCELLED
    );

    public static MaintenanceRequestStatus from(String value) {
        if (value == null || value.isBlank()) {
            return OPEN;
        }
        try {
            return MaintenanceRequestStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new InvalidOperationException("Request status must be one of: " + allowedValues());
        }
    }

    public boolean blocksWork() {
        return WORK_BLOCKING_STATUSES.contains(this);
    }

    public boolean isTerminal() {
        return this == CLOSED || this == CANCELLED || this == REJECTED;
    }

    public String value() {
        return name();
    }

    private static String allowedValues() {
        return Arrays.stream(values()).map(Enum::name).collect(Collectors.joining(", "));
    }
}
