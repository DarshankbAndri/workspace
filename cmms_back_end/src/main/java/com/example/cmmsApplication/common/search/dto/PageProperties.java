package com.example.cmmsApplication.common.search.dto;

import java.util.List;

public class PageProperties {
    private List<?> data;
    private long totalRecords;
    private int pageNumber;
    private int pageSize;
    private int totalPages;

    public PageProperties(List<?> data, long totalRecords, int pageNumber, int pageSize, int totalPages) {
        this.data = data;
        this.totalRecords = totalRecords;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalPages = totalPages;
    }

    public List<?> getData() { return data; }
    public void setData(List<?> data) { this.data = data; }
    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }
    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}




