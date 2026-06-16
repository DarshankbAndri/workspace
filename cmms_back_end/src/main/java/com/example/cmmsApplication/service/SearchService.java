package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SearchService {
    <T> PageProperties getFilteredResults(SearchDTO searchDTO, JpaSpecificationExecutor<T> repository, Class<T> entityClass);
}
