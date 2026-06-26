package com.example.cmmsApplication.common.search.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchDTO {
    private List<SearchCriteriaDTO> searchCriteriaList = new ArrayList<>();
    private String dataOption;
    private PagePropertiesDTO pagination;

    public List<SearchCriteriaDTO> getSearchCriteriaList() { return searchCriteriaList; }
    public void setSearchCriteriaList(List<SearchCriteriaDTO> searchCriteriaList) { this.searchCriteriaList = searchCriteriaList; }
    public String getDataOption() { return dataOption; }
    public void setDataOption(String dataOption) { this.dataOption = dataOption; }
    public PagePropertiesDTO getPagination() { return pagination; }
    public void setPagination(PagePropertiesDTO pagination) { this.pagination = pagination; }
}
