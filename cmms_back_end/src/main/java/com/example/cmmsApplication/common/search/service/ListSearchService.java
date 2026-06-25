package com.example.cmmsApplication.common.search.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.PagePropertiesDTO;
import com.example.cmmsApplication.common.search.dto.SearchCriteriaDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.employee.entity.EmployeeList;
import com.example.cmmsApplication.downtime.entity.EquipmentDowntimeList;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentList;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequestList;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceScheduleList;
import com.example.cmmsApplication.admin.entity.RoleList;
import com.example.cmmsApplication.site.entity.SiteList;
import com.example.cmmsApplication.spareparts.entity.SparePartStockList;
import com.example.cmmsApplication.vendor.entity.VendorList;
import com.example.cmmsApplication.employee.repository.EmployeeListRepository;
import com.example.cmmsApplication.downtime.repository.EquipmentDowntimeListRepository;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentListRepository;
import com.example.cmmsApplication.maintenancerequest.repository.MaintenanceRequestListRepository;
import com.example.cmmsApplication.preventivemaintenance.repository.PreventiveMaintenanceScheduleListRepository;
import com.example.cmmsApplication.admin.repository.RoleListRepository;
import com.example.cmmsApplication.site.repository.SiteListRepository;
import com.example.cmmsApplication.spareparts.repository.SparePartStockListRepository;
import com.example.cmmsApplication.vendor.repository.VendorListRepository;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ListSearchService {
    private static final Set<String> SITE_FILTERS = Set.of(
            "commonSearch", "id", "siteCode", "siteName", "organizationName", "siteType",
            "city", "state", "country", "pincode", "contactPerson", "contactMobile",
            "contactEmail", "status", "createdAt", "updatedAt"
    );
    private static final Set<String> EMPLOYEE_FILTERS = Set.of(
            "commonSearch", "id", "employeeCode", "firstName", "lastName", "mobileNumber",
            "email", "gender", "dateOfBirth", "dateOfJoining", "designation", "department",
            "status", "siteId", "siteName", "assignedSiteCount", "createdAt", "updatedAt"
    );
    private static final Set<String> VENDOR_FILTERS = Set.of(
            "commonSearch", "id", "vendorCode", "vendorName", "contactPerson", "email",
            "phone", "address", "serviceCategory", "active", "siteId", "primarySiteName",
            "siteNames", "assignedSiteCount", "createdAt", "updatedAt"
    );
    private static final Set<String> REQUEST_FILTERS = Set.of(
            "commonSearch", "id", "requestNumber", "equipmentId", "equipmentCode",
            "equipmentName", "siteId", "siteCode", "siteName", "requestType", "priority",
            "status", "title", "description", "reportedBy", "requestedDate",
            "targetCompletionDate", "createdAt", "updatedAt"
    );
    private static final Set<String> ASSIGNMENT_FILTERS = Set.of(
            "commonSearch", "id", "siteId", "siteCode", "siteName", "requestId",
            "requestNumber", "requestTitle", "requestStatus", "vendorId", "vendorName",
            "assignedTo", "assignedDate", "plannedStartDate", "plannedEndDate",
            "actualStartDate", "actualEndDate", "status", "estimatedCost", "actualCost",
            "remarks", "createdAt", "updatedAt"
    );
    private static final Set<String> DOWNTIME_FILTERS = Set.of(
            "commonSearch", "id", "equipmentId", "equipmentCode", "equipmentName", "siteId",
            "siteCode", "siteName", "requestId", "requestNumber", "requestTitle",
            "downtimeStart", "downtimeEnd", "downtimeMinutes", "downtimeHours",
            "downtimeDays", "reason", "planned", "remarks", "createdAt", "updatedAt"
    );
    private static final Set<String> PM_FILTERS = Set.of(
            "commonSearch", "id", "scheduleCode", "siteId", "siteCode", "siteName",
            "equipmentId", "equipmentCode", "equipmentName", "vendorId", "vendorName",
            "title", "description", "frequency", "priority", "assignedTo", "startDate",
            "nextDueDate", "lastGeneratedDate", "active", "status", "lastNotificationStatus",
            "lastNotificationAt", "generatedWorkOrders", "completedWorkOrders",
            "completionPercentage", "createdAt", "updatedAt"
    );
    private static final Set<String> ROLE_FILTERS = Set.of(
            "commonSearch", "id", "roleCode", "roleName", "description", "status",
            "permissionCount", "createdAt", "updatedAt"
    );
    private static final Set<String> SPARE_PART_FILTERS = Set.of(
            "commonSearch", "id", "sparePartId", "partCode", "partName", "description",
            "category", "unit", "preferredVendorId", "preferredVendorName", "siteId",
            "siteCode", "siteName", "currentStock", "reservedStock", "availableStock", "minimumStock", "unitCost",
            "storageLocation", "status", "lowStock", "createdAt", "updatedAt"
    );

    private final SearchService searchService;
    private final AccessControlService accessControlService;
    private final SiteListRepository siteListRepository;
    private final EmployeeListRepository employeeListRepository;
    private final VendorListRepository vendorListRepository;
    private final MaintenanceRequestListRepository maintenanceRequestListRepository;
    private final MaintenanceAssignmentListRepository maintenanceAssignmentListRepository;
    private final EquipmentDowntimeListRepository equipmentDowntimeListRepository;
    private final PreventiveMaintenanceScheduleListRepository preventiveMaintenanceScheduleListRepository;
    private final RoleListRepository roleListRepository;
    private final SparePartStockListRepository sparePartStockListRepository;

    public ListSearchService(SearchService searchService,
                             AccessControlService accessControlService,
                             SiteListRepository siteListRepository,
                             EmployeeListRepository employeeListRepository,
                             VendorListRepository vendorListRepository,
                             MaintenanceRequestListRepository maintenanceRequestListRepository,
                             MaintenanceAssignmentListRepository maintenanceAssignmentListRepository,
                             EquipmentDowntimeListRepository equipmentDowntimeListRepository,
                             PreventiveMaintenanceScheduleListRepository preventiveMaintenanceScheduleListRepository,
                             RoleListRepository roleListRepository,
                             SparePartStockListRepository sparePartStockListRepository) {
        this.searchService = searchService;
        this.accessControlService = accessControlService;
        this.siteListRepository = siteListRepository;
        this.employeeListRepository = employeeListRepository;
        this.vendorListRepository = vendorListRepository;
        this.maintenanceRequestListRepository = maintenanceRequestListRepository;
        this.maintenanceAssignmentListRepository = maintenanceAssignmentListRepository;
        this.equipmentDowntimeListRepository = equipmentDowntimeListRepository;
        this.preventiveMaintenanceScheduleListRepository = preventiveMaintenanceScheduleListRepository;
        this.roleListRepository = roleListRepository;
        this.sparePartStockListRepository = sparePartStockListRepository;
    }

    public PageProperties searchSites(SearchDTO searchDTO) {
        accessControlService.validatePermission("SITE_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, SITE_FILTERS, SiteList.class, "id");
        applySiteAccess(effectiveSearch, "id");
        return searchService.getFilteredResults(effectiveSearch, siteListRepository, SiteList.class);
    }

    public PageProperties searchEmployees(SearchDTO searchDTO) {
        accessControlService.validatePermission("EMPLOYEE_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, EMPLOYEE_FILTERS, EmployeeList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, employeeListRepository, EmployeeList.class);
    }

    public PageProperties searchVendors(SearchDTO searchDTO) {
        accessControlService.validatePermission("VENDOR_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, VENDOR_FILTERS, VendorList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, vendorListRepository, VendorList.class);
    }

    public PageProperties searchMaintenanceRequests(SearchDTO searchDTO) {
        accessControlService.validatePermission("REQUEST_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, REQUEST_FILTERS, MaintenanceRequestList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, maintenanceRequestListRepository, MaintenanceRequestList.class);
    }

    public PageProperties searchMaintenanceAssignments(SearchDTO searchDTO) {
        accessControlService.validatePermission("ASSIGNMENT_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, ASSIGNMENT_FILTERS, MaintenanceAssignmentList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, maintenanceAssignmentListRepository, MaintenanceAssignmentList.class);
    }

    public PageProperties searchDowntime(SearchDTO searchDTO) {
        accessControlService.validatePermission("DOWNTIME_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, DOWNTIME_FILTERS, EquipmentDowntimeList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, equipmentDowntimeListRepository, EquipmentDowntimeList.class);
    }

    public PageProperties searchPreventiveSchedules(SearchDTO searchDTO) {
        accessControlService.validatePermission("REQUEST_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, PM_FILTERS, PreventiveMaintenanceScheduleList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, preventiveMaintenanceScheduleListRepository, PreventiveMaintenanceScheduleList.class);
    }

    public PageProperties searchRoles(SearchDTO searchDTO) {
        accessControlService.validatePermission("ROLE_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, ROLE_FILTERS, RoleList.class, "createdAt");
        return searchService.getFilteredResults(effectiveSearch, roleListRepository, RoleList.class);
    }

    public PageProperties searchSparePartStocks(SearchDTO searchDTO) {
        accessControlService.validatePermission("SPARE_PART_VIEW");
        SearchDTO effectiveSearch = prepare(searchDTO, SPARE_PART_FILTERS, SparePartStockList.class, "createdAt");
        applySiteAccess(effectiveSearch, "siteId");
        return searchService.getFilteredResults(effectiveSearch, sparePartStockListRepository, SparePartStockList.class);
    }

    private SearchDTO prepare(SearchDTO searchDTO, Set<String> allowedKeys, Class<?> entityClass, String defaultSortBy) {
        SearchDTO effectiveSearch = new SearchDTO();
        effectiveSearch.setDataOption("all");
        effectiveSearch.setSearchCriteriaList(normalizeCriteria(searchDTO, allowedKeys));
        effectiveSearch.setPagination(normalizePagination(searchDTO == null ? null : searchDTO.getPagination(), entityClass, defaultSortBy));
        return effectiveSearch;
    }

    private List<SearchCriteriaDTO> normalizeCriteria(SearchDTO searchDTO, Set<String> allowedKeys) {
        List<SearchCriteriaDTO> normalized = new ArrayList<>();
        if (searchDTO == null || searchDTO.getSearchCriteriaList() == null) {
            return normalized;
        }
        for (SearchCriteriaDTO criteria : searchDTO.getSearchCriteriaList()) {
            if (criteria == null || isBlank(criteria.getFilterKey()) || isEmptyValue(criteria.getValue())) {
                continue;
            }
            if (!allowedKeys.contains(criteria.getFilterKey())) {
                throw new IllegalArgumentException("Unsupported filter key: " + criteria.getFilterKey());
            }
            SearchCriteriaDTO copy = new SearchCriteriaDTO();
            copy.setFilterKey(criteria.getFilterKey());
            copy.setDataType(criteria.getDataType());
            copy.setValue(criteria.getValue());
            copy.setOperation(normalizeOperation(criteria.getOperation()));
            normalized.add(copy);
        }
        return normalized;
    }

    private PagePropertiesDTO normalizePagination(PagePropertiesDTO pagination, Class<?> entityClass, String defaultSortBy) {
        PagePropertiesDTO normalized = new PagePropertiesDTO();
        normalized.setStatus(pagination == null ? "ON" : pagination.getStatus());
        normalized.setRecordsPerPage(pagination == null ? 10 : pagination.getRecordsPerPage());
        normalized.setPageNumber(pagination == null ? 0 : pagination.getPageNumber());
        normalized.setPageSize(pagination == null ? 0 : pagination.getPageSize());
        String sortBy = pagination == null ? null : pagination.getSortBy();
        normalized.setSortBy(hasField(entityClass, sortBy) ? sortBy : defaultSortBy);
        normalized.setSortMode("ASC".equalsIgnoreCase(pagination == null ? null : pagination.getSortMode()) ? "ASC" : "DESC");
        return normalized;
    }

    private void applySiteAccess(SearchDTO searchDTO, String siteField) {
        SearchCriteriaDTO siteCriteria = findCriterion(searchDTO.getSearchCriteriaList(), siteField);
        if (siteCriteria != null) {
            accessControlService.validateAnySiteAccess(toLongValues(siteCriteria.getValue()));
            return;
        }
        if (accessControlService.isAdmin()) {
            return;
        }
        List<Long> allowedSiteIds = accessControlService.getAllowedSiteIds();
        SearchCriteriaDTO criteria = new SearchCriteriaDTO();
        criteria.setFilterKey(siteField);
        criteria.setDataType("NUMBER");
        criteria.setValue(allowedSiteIds);
        criteria.setOperation("in");
        searchDTO.getSearchCriteriaList().add(criteria);
    }

    private SearchCriteriaDTO findCriterion(List<SearchCriteriaDTO> criteriaList, String filterKey) {
        return criteriaList.stream()
                .filter((criteria) -> filterKey.equals(criteria.getFilterKey()))
                .findFirst()
                .orElse(null);
    }

    private List<Long> toLongValues(Object value) {
        Collection<?> values = value instanceof Collection<?> collection
                ? collection
                : List.of(value.toString().split(","));
        Set<Long> siteIds = new LinkedHashSet<>();
        for (Object item : values) {
            if (!isEmptyValue(item)) {
                siteIds.add(Long.valueOf(item.toString().trim()));
            }
        }
        return new ArrayList<>(siteIds);
    }

    private String normalizeOperation(String operation) {
        if (operation == null) {
            return "equal";
        }
        String normalized = operation.trim().toLowerCase(Locale.ROOT);
        if ("eq".equals(normalized)) {
            return "equal";
        }
        if ("like".equals(normalized)) {
            return "contains";
        }
        if ("gt".equals(normalized)) {
            return "greater_than";
        }
        if ("lt".equals(normalized)) {
            return "less_than";
        }
        if ("gte".equals(normalized)) {
            return "greater_than_equal";
        }
        if ("lte".equals(normalized)) {
            return "less_than_equal";
        }
        return normalized;
    }

    private boolean hasField(Class<?> entityClass, String fieldName) {
        if (isBlank(fieldName)) {
            return false;
        }
        for (Field field : entityClass.getDeclaredFields()) {
            if (field.getName().equals(fieldName)) {
                return true;
            }
        }
        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isEmptyValue(Object value) {
        if (value == null) {
            return true;
        }
        if (value instanceof String stringValue) {
            return stringValue.trim().isEmpty();
        }
        return value instanceof Collection<?> collection && collection.isEmpty();
    }
}





