package com.example.cmmsApplication.company.service;

import com.example.cmmsApplication.company.dto.CompanyDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/** Service contract for company. */
public interface CompanyService {
    CompanyDTO create(CompanyDTO dto);

    CompanyDTO update(Long id, CompanyDTO dto);

    CompanyDTO getById(Long id);

    CompanyDTO getCurrent();

    CompanyDTO uploadLogo(Long companyId, MultipartFile file);

    Resource getLogo(String fileName);
}
