package com.example.cmmsApplication.equipment.service;


import com.example.cmmsApplication.common.search.service.SearchService;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.entity.EquipmentList;
import com.example.cmmsApplication.site.service.SiteService;
import com.example.cmmsApplication.equipment.dao.EquipmentDAO;
import com.example.cmmsApplication.equipment.dto.EquipmentDTO;
import com.example.cmmsApplication.equipment.dto.EquipmentSummaryDTO;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentRepository;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchCriteriaDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.downtime.entity.EquipmentDowntime;
import com.example.cmmsApplication.downtime.repository.EquipmentDowntimeRepository;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.maintenancerequest.repository.MaintenanceRequestRepository;
import com.example.cmmsApplication.preventivemaintenance.repository.PreventiveMaintenanceScheduleRepository;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.equipment.repository.EquipmentListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
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
            "serialNumber",
            "lifecycleStatus",
            "assetCondition",
            "operatingStatus",
            "ownershipType",
            "commissioningDate",
            "decommissionDate"
    );
    private static final Set<String> EQUIPMENT_STATUSES = Set.of("ACTIVE", "INACTIVE", "UNDER_MAINTENANCE", "RETIRED");
    private static final Set<String> LIFECYCLE_STATUSES = Set.of("DRAFT", "COMMISSIONED", "ACTIVE", "STANDBY", "UNDER_MAINTENANCE", "BREAKDOWN", "DECOMMISSIONED", "SCRAPPED");
    private static final Set<String> ASSET_CONDITIONS = Set.of("GOOD", "FAIR", "POOR", "CRITICAL", "UNKNOWN");
    private static final Set<String> OPERATING_STATUSES = Set.of("RUNNING", "STANDBY", "STOPPED", "UNDER_MAINTENANCE", "BREAKDOWN");
    private static final Set<String> OWNERSHIP_TYPES = Set.of("OWNED", "LEASED", "RENTED", "CUSTOMER_SUPPLIED");
    private static final Set<String> CLOSED_REQUEST_STATUSES = Set.of("CLOSED", "COMPLETED", "CANCELLED", "REJECTED");
    private static final Set<String> CLOSED_ASSIGNMENT_STATUSES = Set.of("COMPLETED", "CANCELLED");
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
            "lifecycleStatus",
            "assetCondition",
            "operatingStatus",
            "ownershipType",
            "commissioningDate",
            "decommissionDate",
            "manufacturer",
            "modelNumber"
    );

    private final EquipmentDAO equipmentDAO;
    private final EquipmentListRepository equipmentListRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final MaintenanceAssignmentRepository maintenanceAssignmentRepository;
    private final PreventiveMaintenanceScheduleRepository preventiveMaintenanceScheduleRepository;
    private final EquipmentDowntimeRepository equipmentDowntimeRepository;
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
        boolean retiredBefore = isRetired(equipment);
        apply(equipment, dto);
        if (!retiredBefore && isRetired(equipment)) {
            validateCanRetire(equipment);
        }
        return toDTO(equipmentDAO.save(equipment));
    }

    @Transactional(readOnly = true)
    public EquipmentDTO getById(Long id) {
        Equipment equipment = getEntity(id);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        EquipmentDTO dto = toDTO(equipment);
        equipmentListRepository.findById(id).ifPresent((equipmentList) -> {
            dto.setEquipmentType(equipmentList.getEquipmentType());
            dto.setVendorId(equipmentList.getVendorId());
            dto.setVendorName(equipmentList.getVendorName());
        });
        return dto;
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

    @Transactional(readOnly = true)
    public EquipmentSummaryDTO getSummary(Long id) {
        Equipment equipment = getEntity(id);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());

        Long openRequestCount = maintenanceRequestRepository.countByEquipmentIdAndStatusNotIn(id, CLOSED_REQUEST_STATUSES);
        Long activePmCount = preventiveMaintenanceScheduleRepository.countByEquipmentIdAndActiveTrue(id);
        Long openDowntimeCount = equipmentDowntimeRepository.countByEquipmentIdAndDowntimeEndIsNull(id);
        EquipmentDowntime lastDowntime = equipmentDowntimeRepository.findTopByEquipmentIdOrderByDowntimeStartDescIdDesc(id).orElse(null);
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime nextMonthStart = currentMonth.plusMonths(1).atDay(1).atStartOfDay();
        Long monthlyDowntime = equipmentDowntimeRepository.sumDowntimeMinutesByEquipmentIdAndDowntimeStartBetween(id, monthStart, nextMonthStart);
        LocalDate lastMaintenanceDate = maintenanceAssignmentRepository.findLastCompletedMaintenanceDateByEquipmentId(id);
        LocalDate nextPmDate = preventiveMaintenanceScheduleRepository.findNextDueDateByEquipmentId(id);
        Integer healthScore = calculateHealthScore(openRequestCount, openDowntimeCount, monthlyDowntime, nextPmDate);

        return EquipmentSummaryDTO.builder()
                .equipmentId(id)
                .openRequestCount(openRequestCount)
                .activePmCount(activePmCount)
                .lastDowntimeAt(lastDowntime == null ? null : lastDowntime.getDowntimeStart())
                .lastDowntimeReason(lastDowntime == null ? null : lastDowntime.getReason())
                .lastDowntimeMinutes(lastDowntime == null ? null : lastDowntime.getDowntimeMinutes())
                .totalDowntimeMinutesThisMonth(monthlyDowntime == null ? 0L : monthlyDowntime)
                .lastMaintenanceDate(lastMaintenanceDate)
                .nextPmDate(nextPmDate)
                .healthScore(healthScore)
                .healthStatus(healthStatus(healthScore))
                .build();
    }

    public void delete(Long id) {
        Equipment equipment = getEntity(id);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        if (isRetired(equipment)) {
            return;
        }
        validateCanRetire(equipment);
        equipment.setStatus("INACTIVE");
        equipment.setLifecycleStatus("DECOMMISSIONED");
        equipment.setOperatingStatus("STOPPED");
        if (equipment.getDecommissionDate() == null) {
            equipment.setDecommissionDate(LocalDate.now());
        }
        equipmentDAO.save(equipment);
    }

    @Transactional(readOnly = true)
    public Equipment getEntity(Long id) {
        return equipmentDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
    }

    public void validateCanReceiveWork(Equipment equipment) {
        if (equipment == null) {
            throw new InvalidOperationException("Equipment is required");
        }
        if ("INACTIVE".equalsIgnoreCase(equipment.getStatus())
                || "DECOMMISSIONED".equalsIgnoreCase(equipment.getLifecycleStatus())
                || "SCRAPPED".equalsIgnoreCase(equipment.getLifecycleStatus())) {
            throw new InvalidOperationException("Retired or inactive equipment cannot receive new maintenance work.");
        }
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
        equipment.setCommissioningDate(dto.getCommissioningDate());
        equipment.setDecommissionDate(dto.getDecommissionDate());
        equipment.setStatus(normalizeAllowed(dto.getStatus(), "ACTIVE", EQUIPMENT_STATUSES, "Equipment status"));
        equipment.setLifecycleStatus(normalizeAllowed(dto.getLifecycleStatus(), "ACTIVE", LIFECYCLE_STATUSES, "Lifecycle status"));
        equipment.setAssetCondition(normalizeAllowed(dto.getAssetCondition(), "GOOD", ASSET_CONDITIONS, "Asset condition"));
        equipment.setOperatingStatus(normalizeAllowed(dto.getOperatingStatus(), defaultOperatingStatus(equipment.getStatus(), equipment.getLifecycleStatus()), OPERATING_STATUSES, "Operating status"));
        equipment.setOwnershipType(normalizeAllowed(dto.getOwnershipType(), "OWNED", OWNERSHIP_TYPES, "Ownership type"));
        equipment.setCriticality(dto.getCriticality() == null ? "MEDIUM" : dto.getCriticality());
        validateLifecycleDates(equipment);
        applyRetiredCompatibility(equipment);
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

    private Integer calculateHealthScore(Long openRequestCount, Long openDowntimeCount, Long monthlyDowntimeMinutes, LocalDate nextPmDate) {
        int score = 100;
        score -= Math.min(40, safeLong(openRequestCount) * 10);
        score -= Math.min(20, safeLong(openDowntimeCount) * 20);
        score -= Math.min(30, (int) (safeLong(monthlyDowntimeMinutes) / 60) * 5);
        if (nextPmDate != null && nextPmDate.isBefore(LocalDate.now())) {
            score -= 15;
        }
        return Math.max(0, Math.min(100, score));
    }

    private String healthStatus(Integer healthScore) {
        if (healthScore == null) {
            return "UNKNOWN";
        }
        if (healthScore < 50) {
            return "CRITICAL";
        }
        if (healthScore < 75) {
            return "WARNING";
        }
        return "GOOD";
    }

    private long safeLong(Long value) {
        return value == null ? 0L : value;
    }

    private void validateCanRetire(Equipment equipment) {
        Long equipmentId = equipment.getId();
        if (maintenanceRequestRepository.countByEquipmentIdAndStatusNotIn(equipmentId, CLOSED_REQUEST_STATUSES) > 0) {
            throw new InvalidOperationException("Equipment cannot be retired while open maintenance requests exist.");
        }
        if (maintenanceAssignmentRepository.countByRequestEquipmentIdAndStatusNotIn(equipmentId, CLOSED_ASSIGNMENT_STATUSES) > 0) {
            throw new InvalidOperationException("Equipment cannot be retired while active maintenance assignments exist.");
        }
        if (preventiveMaintenanceScheduleRepository.countByEquipmentIdAndActiveTrue(equipmentId) > 0) {
            throw new InvalidOperationException("Equipment cannot be retired while active preventive maintenance schedules exist.");
        }
        if (equipmentDowntimeRepository.countByEquipmentIdAndDowntimeEndIsNull(equipmentId) > 0) {
            throw new InvalidOperationException("Equipment cannot be retired while open downtime records exist.");
        }
    }

    private boolean isRetired(Equipment equipment) {
        return "INACTIVE".equalsIgnoreCase(equipment.getStatus())
                || "DECOMMISSIONED".equalsIgnoreCase(equipment.getLifecycleStatus())
                || "SCRAPPED".equalsIgnoreCase(equipment.getLifecycleStatus());
    }

    private void validateLifecycleDates(Equipment equipment) {
        LocalDate commissioningDate = equipment.getCommissioningDate();
        LocalDate decommissionDate = equipment.getDecommissionDate();
        if (commissioningDate != null && decommissionDate != null && decommissionDate.isBefore(commissioningDate)) {
            throw new InvalidOperationException("Decommission date cannot be before commissioning date.");
        }
    }

    private void applyRetiredCompatibility(Equipment equipment) {
        if ("RETIRED".equalsIgnoreCase(equipment.getStatus()) || "INACTIVE".equalsIgnoreCase(equipment.getStatus())) {
            equipment.setStatus("INACTIVE");
            equipment.setLifecycleStatus("DECOMMISSIONED");
        }
        if ("DECOMMISSIONED".equalsIgnoreCase(equipment.getLifecycleStatus()) || "SCRAPPED".equalsIgnoreCase(equipment.getLifecycleStatus())) {
            equipment.setStatus("INACTIVE");
            equipment.setOperatingStatus("STOPPED");
            if (equipment.getDecommissionDate() == null) {
                equipment.setDecommissionDate(LocalDate.now());
            }
        }
    }

    private String normalizeAllowed(String value, String fallback, Set<String> allowed, String label) {
        String normalized = value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(normalized)) {
            throw new InvalidOperationException(label + " must be one of: " + String.join(", ", allowed));
        }
        return normalized;
    }

    private String defaultOperatingStatus(String status, String lifecycleStatus) {
        if ("UNDER_MAINTENANCE".equalsIgnoreCase(status) || "UNDER_MAINTENANCE".equalsIgnoreCase(lifecycleStatus)) {
            return "UNDER_MAINTENANCE";
        }
        if ("BREAKDOWN".equalsIgnoreCase(lifecycleStatus)) {
            return "BREAKDOWN";
        }
        if ("STANDBY".equalsIgnoreCase(lifecycleStatus)) {
            return "STANDBY";
        }
        if ("INACTIVE".equalsIgnoreCase(status) || "DECOMMISSIONED".equalsIgnoreCase(lifecycleStatus) || "SCRAPPED".equalsIgnoreCase(lifecycleStatus)) {
            return "STOPPED";
        }
        return "RUNNING";
    }

    private EquipmentDTO toDTO(Equipment equipment) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(equipment.getId());
        dto.setEquipmentCode(equipment.getEquipmentCode());
        dto.setEquipmentName(equipment.getEquipmentName());
        dto.setSiteId(equipment.getSite() == null ? null : equipment.getSite().getId());
        dto.setSiteCode(equipment.getSite() == null ? null : equipment.getSite().getSiteCode());
        dto.setSiteName(equipment.getSite() == null ? null : equipment.getSite().getSiteName());
        dto.setEquipmentType(equipment.getCategory());
        dto.setCategory(equipment.getCategory());
        dto.setLocation(equipment.getLocation());
        dto.setManufacturer(equipment.getManufacturer());
        dto.setModelNumber(equipment.getModelNumber());
        dto.setSerialNumber(equipment.getSerialNumber());
        dto.setInstallationDate(equipment.getInstallationDate());
        dto.setWarrantyExpiryDate(equipment.getWarrantyExpiryDate());
        dto.setCommissioningDate(equipment.getCommissioningDate());
        dto.setDecommissionDate(equipment.getDecommissionDate());
        dto.setStatus(equipment.getStatus());
        dto.setLifecycleStatus(equipment.getLifecycleStatus());
        dto.setAssetCondition(equipment.getAssetCondition());
        dto.setOperatingStatus(equipment.getOperatingStatus());
        dto.setOwnershipType(equipment.getOwnershipType());
        dto.setCriticality(equipment.getCriticality());
        dto.setCreatedAt(equipment.getCreatedAt());
        dto.setUpdatedAt(equipment.getUpdatedAt());
        return dto;
    }
}
