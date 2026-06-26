package com.example.cmmsApplication.enums;

public enum SearchOperation {
    EQUAL("equal"),
    CONTAINS("contains"),
    IN("in"),
    BETWEEN("between"),
    NOT_EQUAL("not_equal"),
    GREATER_THAN("gt"),
    LESS_THAN("lt"),
    GREATER_THAN_EQUAL("gte"),
    LESS_THAN_EQUAL("lte");

    private final String value;

    SearchOperation(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SearchOperation fromValue(String value) {
        if (value == null) {
            return EQUAL;
        }
        for (SearchOperation operation : values()) {
            if (operation.value.equalsIgnoreCase(value) || operation.name().equalsIgnoreCase(value)) {
                return operation;
            }
        }
        throw new IllegalArgumentException("Unsupported search operation: " + value);
    }
}
