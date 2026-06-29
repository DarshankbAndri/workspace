package com.example.cmmsApplication.company.service;


import com.example.cmmsApplication.common.config.FileStorageConfig;
import com.example.cmmsApplication.company.dao.CompanyDAO;
import com.example.cmmsApplication.company.dto.CompanyDTO;
import com.example.cmmsApplication.company.entity.Company;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {
    private final CompanyDAO companyDAO;
    private final FileStorageConfig fileStorageConfig;

    public CompanyDTO create(CompanyDTO dto) {
        if (companyDAO.existsByCompanyCode(dto.getCompanyCode())) {
            throw new InvalidOperationException("Company code already exists: " + dto.getCompanyCode());
        }
        Company company = new Company();
        apply(company, dto);
        return toDTO(companyDAO.save(company));
    }

    public CompanyDTO update(Long id, CompanyDTO dto) {
        Company company = getEntity(id);
        if (companyDAO.existsByCompanyCodeAndIdNot(dto.getCompanyCode(), id)) {
            throw new InvalidOperationException("Company code already exists: " + dto.getCompanyCode());
        }
        apply(company, dto);
        return toDTO(companyDAO.save(company));
    }

    @Transactional(readOnly = true)
    public CompanyDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public CompanyDTO getCurrent() {
        return companyDAO.findCurrent().map(this::toDTO).orElse(null);
    }

    public CompanyDTO uploadLogo(Long companyId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Logo file is required");
        }
        validateLogo(file);
        Company company = getEntity(companyId);
        Path target = storeLogo(file);
        company.setLogoPath(target.toString());
        company.setLogoUrl("/company/logo/" + target.getFileName());
        return toDTO(companyDAO.save(company));
    }

    @Transactional(readOnly = true)
    public Resource getLogo(String fileName) {
        try {
            Path logoPath = logoDirectory().resolve(fileName).normalize();
            if (!logoPath.startsWith(logoDirectory())) {
                throw new ResourceNotFoundException("Logo not found");
            }
            Resource resource = new UrlResource(logoPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Logo not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Logo not found", ex);
        }
    }

    private Company getEntity(Long id) {
        return companyDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
    }

    private void apply(Company company, CompanyDTO dto) {
        company.setCompanyName(dto.getCompanyName());
        company.setCompanyCode(dto.getCompanyCode());
        company.setEmail(blankToNull(dto.getEmail()));
        company.setPhoneNumber(blankToNull(dto.getPhoneNumber()));
        company.setAddress(blankToNull(dto.getAddress()));
        company.setStatus(isBlank(dto.getStatus()) ? "ACTIVE" : dto.getStatus());
        if (company.getCreatedDate() == null) {
            company.setCreatedDate(LocalDateTime.now());
        }
    }

    private Path storeLogo(MultipartFile file) {
        try {
            Files.createDirectories(logoDirectory());
            String extension = extension(file.getOriginalFilename());
            String storedName = "company-logo-" + UUID.randomUUID() + extension;
            Path target = logoDirectory().resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException ex) {
            throw new InvalidOperationException("Unable to store company logo");
        }
    }

    private void validateLogo(MultipartFile file) {
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/")) {
            throw new InvalidOperationException("Logo must be an image file");
        }
    }

    private Path logoDirectory() {
        return Path.of(fileStorageConfig.getPath()).resolve("company-logos").toAbsolutePath().normalize();
    }

    private String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".bin";
        }
        String ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return ext.matches("\\.(png|jpg|jpeg|gif|webp|svg)") ? ext : ".bin";
    }

    private CompanyDTO toDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setCompanyCode(company.getCompanyCode());
        dto.setEmail(company.getEmail());
        dto.setPhoneNumber(company.getPhoneNumber());
        dto.setAddress(company.getAddress());
        dto.setLogoPath(company.getLogoPath());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setStatus(company.getStatus());
        dto.setCreatedDate(company.getCreatedDate());
        dto.setUpdatedDate(company.getUpdatedDate());
        return dto;
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
