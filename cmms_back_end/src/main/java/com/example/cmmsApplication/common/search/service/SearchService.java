package com.example.cmmsApplication.common.search.service;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SearchService {
    <T> PageProperties getFilteredResults(SearchDTO searchDTO, JpaSpecificationExecutor<T> repository, Class<T> entityClass);
}
