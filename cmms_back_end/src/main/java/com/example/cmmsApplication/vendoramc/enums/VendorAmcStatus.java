package com.example.cmmsApplication.vendoramc.enums;

import java.util.Locale;
import java.util.Set;

public enum VendorAmcStatus {
    DRAFT,
    ACTIVE,
    EXPIRING_SOON,
    EXPIRED,
    TERMINATED,
    RENEWED;

    private static final Set<VendorAmcStatus> MAPPABLE_STATUSES = Set.of(ACTIVE, EXPIRING_SOON);

    public static VendorAmcStatus from(String value) {
        if (value == null || value.isBlank()) {
            return DRAFT;
        }
        return VendorAmcStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    public boolean canAcceptEquipmentMapping() {
        return MAPPABLE_STATUSES.contains(this);
    }
}
