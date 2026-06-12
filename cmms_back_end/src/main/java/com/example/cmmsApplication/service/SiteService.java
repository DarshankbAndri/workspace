package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.SiteDAO;
import com.example.cmmsApplication.dto.SiteDTO;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SiteService {
    private final SiteDAO siteDAO;

    public SiteService(SiteDAO siteDAO) {
        this.siteDAO = siteDAO;
    }

    public SiteDTO create(SiteDTO dto) {
        validateRequired(dto);
        if (siteDAO.existsBySiteCode(dto.getSiteCode())) {
            throw new InvalidOperationException("Site code already exists: " + dto.getSiteCode());
        }
        Site site = new Site();
        apply(site, dto);
        return toDTO(siteDAO.save(site));
    }

    public SiteDTO update(Long id, SiteDTO dto) {
        validateRequired(dto);
        Site site = getEntity(id);
        if (siteDAO.existsBySiteCodeAndIdNot(dto.getSiteCode(), id)) {
            throw new InvalidOperationException("Site code already exists: " + dto.getSiteCode());
        }
        apply(site, dto);
        return toDTO(siteDAO.save(site));
    }

    @Transactional(readOnly = true)
    public SiteDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<SiteDTO> getAll() {
        return siteDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        Site site = getEntity(id);
        site.setStatus("INACTIVE");
        siteDAO.save(site);
    }

    @Transactional(readOnly = true)
    public Site getEntity(Long id) {
        return siteDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + id));
    }

    private void validateRequired(SiteDTO dto) {
        if (isBlank(dto.getSiteCode())) {
            throw new InvalidOperationException("Site code is required");
        }
        if (isBlank(dto.getSiteName())) {
            throw new InvalidOperationException("Site name is required");
        }
    }

    private void apply(Site site, SiteDTO dto) {
        site.setSiteCode(dto.getSiteCode());
        site.setSiteName(dto.getSiteName());
        site.setOrganizationName(dto.getOrganizationName());
        site.setSiteType(dto.getSiteType());
        site.setAddressLine1(dto.getAddressLine1());
        site.setAddressLine2(dto.getAddressLine2());
        site.setCity(dto.getCity());
        site.setState(dto.getState());
        site.setCountry(dto.getCountry());
        site.setPincode(dto.getPincode());
        site.setContactPerson(dto.getContactPerson());
        site.setContactMobile(dto.getContactMobile());
        site.setContactEmail(dto.getContactEmail());
        site.setLatitude(dto.getLatitude());
        site.setLongitude(dto.getLongitude());
        site.setStatus(isBlank(dto.getStatus()) ? "ACTIVE" : dto.getStatus());
    }

    private SiteDTO toDTO(Site site) {
        SiteDTO dto = new SiteDTO();
        dto.setId(site.getId());
        dto.setSiteCode(site.getSiteCode());
        dto.setSiteName(site.getSiteName());
        dto.setOrganizationName(site.getOrganizationName());
        dto.setSiteType(site.getSiteType());
        dto.setAddressLine1(site.getAddressLine1());
        dto.setAddressLine2(site.getAddressLine2());
        dto.setCity(site.getCity());
        dto.setState(site.getState());
        dto.setCountry(site.getCountry());
        dto.setPincode(site.getPincode());
        dto.setContactPerson(site.getContactPerson());
        dto.setContactMobile(site.getContactMobile());
        dto.setContactEmail(site.getContactEmail());
        dto.setLatitude(site.getLatitude());
        dto.setLongitude(site.getLongitude());
        dto.setStatus(site.getStatus());
        dto.setCreatedAt(site.getCreatedAt());
        dto.setUpdatedAt(site.getUpdatedAt());
        return dto;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
