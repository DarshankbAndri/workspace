package com.example.cmmsApplication.common.search.dto;

public class PagePropertiesDTO {
    private String status;
    private Integer recordsPerPage;
    private String sortBy;
    private String sortMode;
    private Integer pageNumber;
    private Integer pageSize;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getRecordsPerPage() { return recordsPerPage; }
    public void setRecordsPerPage(Integer recordsPerPage) { this.recordsPerPage = recordsPerPage; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public String getSortMode() { return sortMode; }
    public void setSortMode(String sortMode) { this.sortMode = sortMode; }
    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
}




