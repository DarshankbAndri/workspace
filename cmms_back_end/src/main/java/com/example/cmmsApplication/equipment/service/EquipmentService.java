package com.example.cmmsApplication.equipment.service;


import com.example.cmmsApplication.common.search.service.SearchService;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.entity.EquipmentList;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.equipment.dao.EquipmentDAO;
import com.example.cmmsApplication.equipment.dto.EquipmentDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchCriteriaDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.equipment.repository.EquipmentListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentService {
    private static final Set<String> ALLOWED_SEARCH_KEYS = Set.of(
            "commonSearch",
            "equipmentName",
            "equipmentCode",
            "equipmentType",
            "equipmentStatus",
            "status",
            "siteId",
            "siteCode",
            "siteName",
            "vendorId",
            "vendorName",
            "make",
            "model",
            "serialNumber"
    );
    private static final Set<String> ALLOWED_SORT_KEYS = Set.of(
            "id",
            "equipmentName",
            "equipmentCode",
            "equipmentType",
            "equipmentStatus",
            "status",
            "siteId",
            "siteCode",
            "siteName",
            "vendorId",
            "vendorName",
            "make",
            "model",
            "serialNumber",
            "createdAt",
            "lastModifiedOn",
            "category",
            "location",
            "criticality",
            "manufacturer",
            "modelNumber"
    );

    private final EquipmentDAO equipmentDAO;
    private final EquipmentListRepository equipmentListRepository;
    private final SearchService searchService;
    private final SiteService siteService;
    private final AccessControlService accessControlService;

    public EquipmentDTO create(EquipmentDTO dto) {
        accessControlService.validateSiteAccess(dto.getSiteId());
        if (equipmentDAO.existsByEquipmentCode(dto.getEquipmentCode())) {
            throw new InvalidOperationException("Equipment code already exists: " + dto.getEquipmentCode());
        }
        Equipment equipment = new Equipment();
        apply(equipment, dto);
        return toDTO(equipmentDAO.save(equipment));
    }

    public EquipmentDTO update(Long id, EquipmentDTO dto) {
        Equipment equipment = getEntity(id);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        accessControlService.validateSiteAccess(dto.getSiteId());
        if (equipmentDAO.existsByEquipmentCodeAndIdNot(dto.getEquipmentCode(), id)) {
            throw new InvalidOperationException("Equipment code already exists: " + dto.getEquipmentCode());
        }
        apply(equipment, dto);
        return toDTO(equipmentDAO.save(equipment));
    }

    @Transactional(readOnly = true)
    public EquipmentDTO getById(Long id) {
        Equipment equipment = getEntity(id);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        return toDTO(equipment);
    }

    @Transactional(readOnly = true)
    public List<EquipmentDTO> getAll(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        List<Equipment> equipment = siteId != null
                ? equipmentDAO.findBySiteId(siteId)
                : accessControlService.isAdmin() ? equipmentDAO.findAll() : equipmentDAO.findBySiteIds(accessControlService.getAllowedSiteIds());
        return equipment.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageProperties searchEquipment(SearchDTO searchDTO) {
        SearchDTO effectiveSearch = searchDTO == null ? new SearchDTO() : searchDTO;
        validateEquipmentSearchKeys(effectiveSearch);
        normalizeOperations(effectiveSearch);
        applyDefaultSort(effectiveSearch);
        applySiteAccessFilter(effectiveSearch);
        return searchService.getFilteredResults(effectiveSearch, equipmentListRepository, com.example.cmmsApplication.equipment.entity.EquipmentList.class);
    }

    public void delete(Long id) {
        Equipment equipment = getEntity(id);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        equipmentDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Equipment getEntity(Long id) {
        return equipmentDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
    }

    private void apply(Equipment equipment, EquipmentDTO dto) {
        Site site = validateActiveSite(dto.getSiteId());
        equipment.setSite(site);
        equipment.setEquipmentCode(dto.getEquipmentCode());
        equipment.setEquipmentName(dto.getEquipmentName());
        equipment.setCategory(dto.getCategory());
        equipment.setLocation(dto.getLocation());
        equipment.setManufacturer(dto.getManufacturer());
        equipment.setModelNumber(dto.getModelNumber());
        equipment.setSerialNumber(dto.getSerialNumber());
        equipment.setInstallationDate(dto.getInstallationDate());
        equipment.setWarrantyExpiryDate(dto.getWarrantyExpiryDate());
        equipment.setStatus(dto.getStatus() == null ? "ACTIVE" : dto.getStatus());
        equipment.setCriticality(dto.getCriticality() == null ? "MEDIUM" : dto.getCriticality());
    }

    private Site validateActiveSite(Long siteId) {
        if (siteId == null) {
            throw new InvalidOperationException("Site is required");
        }
        Site site = siteService.getEntity(siteId);
        if (!"ACTIVE".equalsIgnoreCase(site.getStatus())) {
            throw new InvalidOperationException("Selected site is inactive");
        }
        return site;
    }

    private void validateEquipmentSearchKeys(SearchDTO searchDTO) {
        if (searchDTO.getSearchCriteriaList() != null) {
            for (SearchCriteriaDTO criteria : searchDTO.getSearchCriteriaList()) {
                if (criteria != null && !isBlank(criteria.getFilterKey()) && !ALLOWED_SEARCH_KEYS.contains(criteria.getFilterKey())) {
                    throw new InvalidOperationException("Unsupported equipment filter key: " + criteria.getFilterKey());
                }
            }
        }
        if (searchDTO.getPagination() != null && !isBlank(searchDTO.getPagination().getSortBy())
                && !ALLOWED_SORT_KEYS.contains(searchDTO.getPagination().getSortBy())) {
            throw new InvalidOperationException("Unsupported equipment sort key: " + searchDTO.getPagination().getSortBy());
        }
    }

    private void normalizeOperations(SearchDTO searchDTO) {
        if (searchDTO.getSearchCriteriaList() == null) {
            searchDTO.setSearchCriteriaList(new ArrayList<>());
            return;
        }
        for (SearchCriteriaDTO criteria : searchDTO.getSearchCriteriaList()) {
            if (criteria == null || isBlank(criteria.getOperation())) {
                continue;
            }
            String operation = criteria.getOperation().trim().toLowerCase(Locale.ROOT);
            if ("eq".equals(operation)) {
                criteria.setOperation("equal");
            } else if ("like".equals(operation)) {
                criteria.setOperation("contains");
            } else {
                criteria.setOperation(operation);
            }
        }
    }

    private void applyDefaultSort(SearchDTO searchDTO) {
        if (searchDTO.getPagination() != null && isBlank(searchDTO.getPagination().getSortBy())) {
            searchDTO.getPagination().setSortBy("createdAt");
            searchDTO.getPagination().setSortMode("DESC");
        }
    }

    private void applySiteAccessFilter(SearchDTO searchDTO) {
        if (searchDTO.getSearchCriteriaList() == null) {
            searchDTO.setSearchCriteriaList(new ArrayList<>());
        }
        SearchCriteriaDTO requestedSiteFilter = searchDTO.getSearchCriteriaList().stream()
                .filter((criteria) -> criteria != null && "siteId".equals(criteria.getFilterKey()) && !isEmptyValue(criteria.getValue()))
                .findFirst()
                .orElse(null);
        if (requestedSiteFilter != null) {
            accessControlService.validateSiteAccess(Long.valueOf(requestedSiteFilter.getValue().toString()));
        }
        if (!accessControlService.isAdmin()) {
            SearchCriteriaDTO accessCriteria = new SearchCriteriaDTO();
            accessCriteria.setFilterKey("siteId");
            accessCriteria.setDataType("LONG");
            accessCriteria.setValue(accessControlService.getAllowedSiteIds());
            accessCriteria.setOperation("in");
            searchDTO.getSearchCriteriaList().add(accessCriteria);
            searchDTO.setDataOption("all");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isEmptyValue(Object value) {
        if (value == null) {
            return true;
        }
        if (value instanceof String) {
            return ((String) value).trim().isEmpty();
        }
        if (value instanceof Collection<?>) {
            return ((Collection<?>) value).isEmpty();
        }
        return false;
    }

    private EquipmentDTO toDTO(Equipment equipment) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(equipment.getId());
        dto.setEquipmentCode(equipment.getEquipmentCode());
        dto.setEquipmentName(equipment.getEquipmentName());
        dto.setSiteId(equipment.getSite() == null ? null : equipment.getSite().getId());
        dto.setSiteCode(equipment.getSite() == null ? null : equipment.getSite().getSiteCode());
        dto.setSiteName(equipment.getSite() == null ? null : equipment.getSite().getSiteName());
        dto.setCategory(equipment.getCategory());
        dto.setLocation(equipment.getLocation());
        dto.setManufacturer(equipment.getManufacturer());
        dto.setModelNumber(equipment.getModelNumber());
        dto.setSerialNumber(equipment.getSerialNumber());
        dto.setInstallationDate(equipment.getInstallationDate());
        dto.setWarrantyExpiryDate(equipment.getWarrantyExpiryDate());
        dto.setStatus(equipment.getStatus());
        dto.setCriticality(equipment.getCriticality());
        dto.setCreatedAt(equipment.getCreatedAt());
        dto.setUpdatedAt(equipment.getUpdatedAt());
        return dto;
    }
}
