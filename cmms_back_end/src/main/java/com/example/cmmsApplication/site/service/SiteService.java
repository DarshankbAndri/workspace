package com.example.cmmsApplication.site.service;

import com.example.cmmsApplication.site.dto.SiteDTO;
import com.example.cmmsApplication.site.entity.Site;
import java.util.List;

/** Service contract for site. */
public interface SiteService {
    SiteDTO create(SiteDTO dto);

    SiteDTO update(Long id, SiteDTO dto);

    SiteDTO getById(Long id);

    List<SiteDTO> getAll();

    void delete(Long id);

    Site getEntity(Long id);
}
