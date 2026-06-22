package com.example.cmmsApplication.common.search.dto;

public class SearchCriteriaDTO {
    private String filterKey;
    private String dataType;
    private Object value;
    private String operation;

    public String getFilterKey() { return filterKey; }
    public void setFilterKey(String filterKey) { this.filterKey = filterKey; }
    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }
    public Object getValue() { return value; }
    public void setValue(Object value) { this.value = value; }
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
}




