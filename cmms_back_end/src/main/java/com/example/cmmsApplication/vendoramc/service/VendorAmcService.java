package com.example.cmmsApplication.vendoramc.service;

import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchCriteriaDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.dao.EquipmentDAO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.service.EquipmentService;
import com.example.cmmsApplication.maintenancerequest.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.notification.service.NotificationService;
import com.example.cmmsApplication.preventivemaintenance.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.site.dao.SiteDAO;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendor.service.VendorService;
import com.example.cmmsApplication.vendoramc.dao.EquipmentAmcMappingDAO;
import com.example.cmmsApplication.vendoramc.dao.VendorAmcContractDAO;
import com.example.cmmsApplication.vendoramc.dto.EquipmentAmcMappingDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcContractDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcDashboardDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcPmScheduleDTO;
import com.example.cmmsApplication.vendoramc.entity.EquipmentAmcMapping;
import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import com.example.cmmsApplication.vendoramc.enums.VendorAmcStatus;
import com.example.cmmsApplication.vendoramc.mapper.VendorAmcMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorAmcService {
    private static final Set<String> ACTIVE_CONTRACT_STATUSES = Set.of("ACTIVE", "EXPIRING_SOON");

    private final VendorAmcContractDAO contractDAO;
    private final EquipmentAmcMappingDAO mappingDAO;
    private final VendorAmcMapper mapper;
    private final VendorService vendorService;
    private final EquipmentService equipmentService;
    private final EquipmentDAO equipmentDAO;
    private final SiteDAO siteDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final PreventiveMaintenanceScheduleDAO pmScheduleDAO;
    private final AccessControlService accessControlService;
    private final NotificationService notificationService;

    @Value("${cmms.amc.expiry-warning-days:30}")
    private int expiryWarningDays;

    public VendorAmcContractDTO createAmcContract(VendorAmcContractDTO dto) {
        VendorAmcContract contract = new VendorAmcContract();
        apply(contract, dto, false);
        if (contractDAO.existsByContractNumber(contract.getContractNumber())) {
            throw new InvalidOperationException("AMC contract number already exists: " + contract.getContractNumber());
        }
        VendorAmcContract saved = contractDAO.save(contract);
        for (EquipmentAmcMappingDTO mapping : dto.getEquipmentMappings() == null ? List.<EquipmentAmcMappingDTO>of() : dto.getEquipmentMappings()) {
            if (mapping.getEquipmentId() != null) {
                mapEquipment(saved.getId(), mapping);
            }
        }
        return getAmcContract(saved.getId());
    }

    public VendorAmcContractDTO updateAmcContract(Long id, VendorAmcContractDTO dto) {
        VendorAmcContract contract = getEntity(id);
        apply(contract, dto, true);
        if (contractDAO.existsByContractNumberAndIdNot(contract.getContractNumber(), id)) {
            throw new InvalidOperationException("AMC contract number already exists: " + contract.getContractNumber());
        }
        return mapper.toDTO(contractDAO.save(contract), mappingDAO.findByContractId(id));
    }

    @Transactional(readOnly = true)
    public VendorAmcContractDTO getAmcContract(Long id) {
        VendorAmcContract contract = getEntity(id);
        return mapper.toDTO(contract, mappingDAO.findByContractId(id));
    }

    @Transactional(readOnly = true)
    public PageProperties searchAmcContracts(SearchDTO searchDTO) {
        SearchDTO effective = searchDTO == null ? new SearchDTO() : searchDTO;
        int page = effective.getPagination() == null ? 0 : Math.max(effective.getPagination().getPageNumber(), 0);
        int size = effective.getPagination() == null ? 10 : Math.max(effective.getPagination().getRecordsPerPage(), 1);
        List<VendorAmcContractDTO> filtered = contractDAO.findAll().stream()
                .filter(this::isAllowedContract)
                .filter((contract) -> matches(contract, effective.getSearchCriteriaList()))
                .sorted(Comparator.comparing(VendorAmcContract::getEndDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map((contract) -> mapper.toDTO(contract, mappingDAO.findByContractId(contract.getId())))
                .toList();
        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        int totalPages = filtered.isEmpty() ? 0 : (int) Math.ceil((double) filtered.size() / size);
        return new PageProperties(filtered.subList(fromIndex, toIndex), filtered.size(), page, size, totalPages);
    }

    public void deleteAmcContract(Long id) {
        VendorAmcContract contract = getEntity(id);
        if (requestDAO.countByAmcContractId(id) > 0) {
            throw new InvalidOperationException("AMC contracts linked to maintenance requests cannot be deleted");
        }
        if (pmScheduleDAO.countByAmcContractId(id) > 0) {
            throw new InvalidOperationException("AMC contracts linked to preventive maintenance schedules cannot be deleted");
        }
        if (mappingDAO.countByContractId(id) > 0) {
            mappingDAO.deleteByContractId(id);
        }
        contractDAO.deleteById(contract.getId());
    }

    public EquipmentAmcMappingDTO mapEquipment(Long contractId, EquipmentAmcMappingDTO dto) {
        VendorAmcContract contract = getEntity(contractId);
        VendorAmcStatus status = VendorAmcStatus.from(contract.getStatus());
        if (!status.canAcceptEquipmentMapping()) {
            throw new InvalidOperationException("Expired, terminated, renewed, or draft AMC cannot accept equipment mappings");
        }
        Equipment equipment = equipmentService.getEntity(dto.getEquipmentId());
        validateEquipmentBelongsToContractSite(contract, equipment);
        if (!"ACTIVE".equalsIgnoreCase(equipment.getStatus())) {
            throw new InvalidOperationException("Equipment must be active for AMC mapping");
        }
        if (mappingDAO.existsByContractAndEquipment(contractId, equipment.getId())) {
            throw new InvalidOperationException("Equipment is already mapped to this AMC contract");
        }
        LocalDate coverageStart = dto.getCoverageStartDate() == null ? contract.getStartDate() : dto.getCoverageStartDate();
        LocalDate coverageEnd = dto.getCoverageEndDate() == null ? contract.getEndDate() : dto.getCoverageEndDate();
        validateCoverageDates(contract, coverageStart, coverageEnd);
        if (mappingDAO.countOverlappingActive(equipment.getId(), contractId, coverageStart, coverageEnd, ACTIVE_CONTRACT_STATUSES) > 0) {
            throw new InvalidOperationException("Equipment already has an overlapping active AMC contract");
        }
        EquipmentAmcMapping mapping = new EquipmentAmcMapping();
        mapping.setAmcContract(contract);
        mapping.setEquipment(equipment);
        mapping.setCoverageType(defaultText(dto.getCoverageType(), "FULL"));
        mapping.setCoverageStartDate(coverageStart);
        mapping.setCoverageEndDate(coverageEnd);
        mapping.setRemarks(dto.getRemarks());
        mapping.setActive(dto.getActive() == null || dto.getActive());
        return mapper.toDTO(mappingDAO.save(mapping));
    }

    public void removeEquipmentMapping(Long contractId, Long equipmentId) {
        EquipmentAmcMapping mapping = mappingDAO.findByContractAndEquipment(contractId, equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("AMC equipment mapping not found"));
        mapping.setActive(false);
        mappingDAO.save(mapping);
    }

    @Transactional(readOnly = true)
    public List<EquipmentAmcMappingDTO> getContractEquipment(Long contractId) {
        getEntity(contractId);
        return mappingDAO.findByContractId(contractId).stream().map(mapper::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<VendorAmcPmScheduleDTO> getLinkedPmSchedules(Long contractId) {
        getEntity(contractId);
        return pmScheduleDAO.findByAmcContractId(contractId).stream()
                .filter((schedule) -> accessControlService.isAdmin()
                        || (schedule.getSite() != null && accessControlService.getAllowedSiteIds().contains(schedule.getSite().getId())))
                .map(this::toPmScheduleDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VendorAmcContractDTO> getVendorAmcContracts(Long vendorId) {
        vendorService.getEntity(vendorId);
        return contractDAO.findByVendorId(vendorId).stream()
                .filter(this::isAllowedContract)
                .map((contract) -> mapper.toDTO(contract, mappingDAO.findByContractId(contract.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public VendorAmcContractDTO getActiveAmcForEquipment(Long equipmentId) {
        equipmentService.getEntity(equipmentId);
        List<EquipmentAmcMapping> mappings = mappingDAO.findActiveByEquipment(equipmentId, LocalDate.now(), ACTIVE_CONTRACT_STATUSES);
        if (mappings.isEmpty()) {
            return null;
        }
        EquipmentAmcMapping mapping = mappings.get(0);
        VendorAmcContractDTO dto = mapper.toDTO(mapping.getAmcContract(), List.of(mapping));
        dto.setCoveredEquipmentCount((int) mappingDAO.countByContractId(mapping.getAmcContract().getId()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<VendorAmcContractDTO> getAmcContractsForEquipment(Long equipmentId) {
        Equipment equipment = equipmentService.getEntity(equipmentId);
        if (equipment.getSite() != null) {
            accessControlService.validateSiteAccess(equipment.getSite().getId());
        }
        return mappingDAO.findByEquipmentId(equipmentId).stream()
                .filter((mapping) -> mapping.getAmcContract() != null)
                .filter((mapping) -> isAllowedContract(mapping.getAmcContract()))
                .map((mapping) -> {
                    VendorAmcContractDTO dto = mapper.toDTO(mapping.getAmcContract(), List.of(mapping));
                    dto.setCoveredEquipmentCount((int) mappingDAO.countByContractId(mapping.getAmcContract().getId()));
                    return dto;
                })
                .toList();
    }

    public VendorAmcContractDTO renewAmcContract(Long id, VendorAmcContractDTO dto) {
        VendorAmcContract previous = getEntity(id);
        VendorAmcContract renewal = new VendorAmcContract();
        apply(renewal, dto, false);
        renewal.setRenewedFromContract(previous);
        if (contractDAO.existsByContractNumber(renewal.getContractNumber())) {
            throw new InvalidOperationException("AMC contract number already exists: " + renewal.getContractNumber());
        }
        previous.setStatus(VendorAmcStatus.RENEWED.name());
        contractDAO.save(previous);
        return mapper.toDTO(contractDAO.save(renewal), List.of());
    }

    @Transactional(readOnly = true)
    public VendorAmcDashboardDTO getDashboard() {
        return getDashboard(null);
    }

    @Transactional(readOnly = true)
    public VendorAmcDashboardDTO getDashboard(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        List<VendorAmcContract> allowedContracts = contractDAO.findAll().stream()
                .filter(this::isAllowedContract)
                .filter((contract) -> belongsToSite(contract, siteId))
                .toList();
        long active = countContractsByStatus(allowedContracts, VendorAmcStatus.ACTIVE.name())
                + countContractsByStatus(allowedContracts, VendorAmcStatus.EXPIRING_SOON.name());
        long expiring = countContractsByStatus(allowedContracts, VendorAmcStatus.EXPIRING_SOON.name());
        long expired = countContractsByStatus(allowedContracts, VendorAmcStatus.EXPIRED.name());
        Set<Long> activeContractIds = allowedContracts.stream()
                .filter((contract) -> ACTIVE_CONTRACT_STATUSES.contains(normalizeStatus(contract.getStatus())))
                .map(VendorAmcContract::getId)
                .collect(Collectors.toSet());
        long covered = activeContractIds.isEmpty() ? 0 : mappingDAO.findAll().stream()
                .filter((mapping) -> Boolean.TRUE.equals(mapping.getActive()))
                .filter((mapping) -> mapping.getAmcContract() != null && activeContractIds.contains(mapping.getAmcContract().getId()))
                .filter((mapping) -> LocalDate.now().compareTo(mapping.getCoverageStartDate()) >= 0 && LocalDate.now().compareTo(mapping.getCoverageEndDate()) <= 0)
                .map((mapping) -> mapping.getEquipment() == null ? null : mapping.getEquipment().getId())
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();
        long equipmentCount = scopedEquipmentCount(siteId);
        long equipmentWithoutAmc = Math.max(equipmentCount - covered, 0);
        return VendorAmcDashboardDTO.builder()
                .activeContracts(active)
                .expiringContracts(expiring)
                .expiredContracts(expired)
                .coveredEquipment(covered)
                .equipmentWithoutAmc(equipmentWithoutAmc)
                .build();
    }

    @Scheduled(cron = "${cmms.amc.expiry-scan-cron:0 0 7 * * *}")
    public void scanExpiryStatus() {
        LocalDate today = LocalDate.now();
        contractDAO.findExpiring(today, today.plusDays(expiryWarningDays)).forEach((contract) -> {
            contract.setStatus(VendorAmcStatus.EXPIRING_SOON.name());
            VendorAmcContract saved = contractDAO.save(contract);
            notificationService.createAmcExpiryAlert(saved, "AMC_EXPIRING_SOON", today);
        });
        contractDAO.findExpired(today).forEach((contract) -> {
            contract.setStatus(VendorAmcStatus.EXPIRED.name());
            VendorAmcContract saved = contractDAO.save(contract);
            notificationService.createAmcExpiryAlert(saved, "AMC_EXPIRED", today);
        });
    }

    @Transactional(readOnly = true)
    public VendorAmcContract getEntity(Long id) {
        VendorAmcContract contract = contractDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AMC contract not found with id: " + id));
        if (contract.getSite() != null) {
            accessControlService.validateSiteAccess(contract.getSite().getId());
        }
        return contract;
    }

    private void apply(VendorAmcContract contract, VendorAmcContractDTO dto, boolean update) {
        Site site = siteDAO.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + dto.getSiteId()));
        accessControlService.validateSiteAccess(site.getId());
        Vendor vendor = vendorService.getEntity(dto.getVendorId());
        if (!Boolean.TRUE.equals(vendor.getActive())) {
            throw new InvalidOperationException("Vendor must be active for AMC contract");
        }
        if (!vendorService.isVendorAssignedToSite(vendor.getId(), site.getId())) {
            throw new InvalidOperationException("Vendor must be assigned to the selected AMC site");
        }
        if (dto.getEndDate() == null || dto.getStartDate() == null || !dto.getEndDate().isAfter(dto.getStartDate())) {
            throw new InvalidOperationException("AMC end date must be after start date");
        }
        contract.setSite(site);
        contract.setVendor(vendor);
        contract.setContractNumber(dto.getContractNumber());
        contract.setContractName(dto.getContractName());
        contract.setContractType(dto.getContractType());
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setContractValue(dto.getContractValue());
        contract.setCoverageDescription(dto.getCoverageDescription());
        contract.setResponseTimeHours(dto.getResponseTimeHours());
        contract.setResolutionTimeHours(dto.getResolutionTimeHours());
        contract.setIncludesLabor(dto.getIncludesLabor() == null || dto.getIncludesLabor());
        contract.setIncludesSpares(Boolean.TRUE.equals(dto.getIncludesSpares()));
        contract.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? (update ? contract.getStatus() : VendorAmcStatus.DRAFT.name()) : VendorAmcStatus.from(dto.getStatus()).name());
        contract.setContactPerson(dto.getContactPerson());
        contract.setContactPhone(dto.getContactPhone());
        contract.setContactEmail(dto.getContactEmail());
        contract.setRemarks(dto.getRemarks());
    }

    private void validateCoverageDates(VendorAmcContract contract, LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new InvalidOperationException("Equipment coverage end date must be on or after coverage start date");
        }
        if (start.isBefore(contract.getStartDate()) || end.isAfter(contract.getEndDate())) {
            throw new InvalidOperationException("Equipment coverage dates must remain within AMC contract dates");
        }
    }

    private VendorAmcPmScheduleDTO toPmScheduleDTO(PreventiveMaintenanceSchedule schedule) {
        return VendorAmcPmScheduleDTO.builder()
                .id(schedule.getId())
                .scheduleCode(schedule.getScheduleCode())
                .siteName(schedule.getSite() == null ? null : schedule.getSite().getSiteName())
                .equipmentCode(schedule.getEquipment() == null ? null : schedule.getEquipment().getEquipmentCode())
                .equipmentName(schedule.getEquipment() == null ? null : schedule.getEquipment().getEquipmentName())
                .title(schedule.getTitle())
                .frequency(schedule.getFrequency())
                .priority(schedule.getPriority())
                .startDate(schedule.getStartDate())
                .endDate(schedule.getEndDate())
                .nextDueDate(schedule.getNextDueDate())
                .active(schedule.getActive())
                .status(schedule.getStatus())
                .build();
    }

    private boolean matches(VendorAmcContract contract, List<SearchCriteriaDTO> criteriaList) {
        if (criteriaList == null || criteriaList.isEmpty()) {
            return true;
        }
        for (SearchCriteriaDTO criteria : criteriaList) {
            if (!matchesCriterion(contract, criteria)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchesCriterion(VendorAmcContract contract, SearchCriteriaDTO criteria) {
        String key = criteria.getFilterKey();
        String value = criteria.getValue() == null ? "" : String.valueOf(criteria.getValue()).trim().toLowerCase(Locale.ROOT);
        if (value.isBlank()) {
            return true;
        }
        if ("commonSearch".equals(key)) {
            String haystack = List.of(contract.getContractNumber(), contract.getContractName(), contract.getStatus(),
                            contract.getVendor() == null ? "" : contract.getVendor().getVendorName()).stream()
                    .collect(Collectors.joining(" ")).toLowerCase(Locale.ROOT);
            return haystack.contains(value);
        }
        if ("status".equals(key)) {
            return value.equalsIgnoreCase(contract.getStatus());
        }
        if ("vendorId".equals(key)) {
            return contract.getVendor() != null && String.valueOf(contract.getVendor().getId()).equals(value);
        }
        if ("siteId".equals(key)) {
            return contract.getSite() != null && String.valueOf(contract.getSite().getId()).equals(value);
        }
        return true;
    }

    private boolean isAllowedContract(VendorAmcContract contract) {
        if (contract == null || contract.getSite() == null || accessControlService.isAdmin()) {
            return true;
        }
        return accessControlService.getAllowedSiteIds().contains(contract.getSite().getId());
    }

    private boolean belongsToSite(VendorAmcContract contract, Long siteId) {
        if (siteId == null) {
            return true;
        }
        return contract != null && contract.getSite() != null && siteId.equals(contract.getSite().getId());
    }

    private void validateEquipmentBelongsToContractSite(VendorAmcContract contract, Equipment equipment) {
        Long contractSiteId = contract.getSite() == null ? null : contract.getSite().getId();
        Long equipmentSiteId = equipment.getSite() == null ? null : equipment.getSite().getId();
        if (contractSiteId == null || equipmentSiteId == null || !contractSiteId.equals(equipmentSiteId)) {
            throw new InvalidOperationException("AMC equipment must belong to the selected AMC site");
        }
    }

    private long countContractsByStatus(List<VendorAmcContract> contracts, String status) {
        return contracts.stream()
                .filter((contract) -> status.equalsIgnoreCase(contract.getStatus()))
                .count();
    }

    private long scopedEquipmentCount(Long siteId) {
        if (siteId != null) {
            return equipmentDAO.countBySiteId(siteId);
        }
        if (accessControlService.isAdmin()) {
            return equipmentDAO.count();
        }
        return accessControlService.getAllowedSiteIds().stream()
                .mapToLong(equipmentDAO::countBySiteId)
                .sum();
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
