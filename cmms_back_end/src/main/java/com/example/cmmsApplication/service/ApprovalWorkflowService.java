package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.ApprovalActionDAO;
import com.example.cmmsApplication.dao.ApprovalConfigDAO;
import com.example.cmmsApplication.dao.ApprovalRequestDAO;
import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dao.PreventiveMaintenanceScheduleDAO;
import com.example.cmmsApplication.dto.ApprovalActionDTO;
import com.example.cmmsApplication.dto.ApprovalRequestDTO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.PagePropertiesDTO;
import com.example.cmmsApplication.dto.SearchCriteriaDTO;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.entity.ApprovalAction;
import com.example.cmmsApplication.entity.ApprovalConfig;
import com.example.cmmsApplication.entity.ApprovalRequest;
import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.entity.Site;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApprovalWorkflowService {
    public static final String PM_SCHEDULE = "PM_SCHEDULE";
    public static final String PM_WORK_ORDER = "PM_WORK_ORDER";
    public static final String MAINTENANCE_REQUEST = "MAINTENANCE_REQUEST";
    public static final String SPARE_ISSUE = "SPARE_ISSUE";
    public static final String CREATE = "CREATE";
    public static final String UPDATE = "UPDATE";
    public static final String GENERATE = "GENERATE";
    public static final String CLOSE = "CLOSE";
    public static final String RESERVE = "RESERVE";
    public static final String ISSUE = "ISSUE";

    private final boolean globalApprovalEnabled;
    private final ApprovalConfigDAO approvalConfigDAO;
    private final ApprovalRequestDAO approvalRequestDAO;
    private final ApprovalActionDAO approvalActionDAO;
    private final MaintenanceRequestDAO maintenanceRequestDAO;
    private final PreventiveMaintenanceScheduleDAO scheduleDAO;
    private final AccessControlService accessControlService;
    private final ObjectProvider<PreventiveMaintenanceScheduleService> scheduleServiceProvider;
    private final ObjectProvider<MaintenanceSpareUsageService> spareUsageServiceProvider;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private static final Set<String> APPROVAL_HISTORY_FILTERS = Set.of(
            "commonSearch", "moduleCode", "actionCode", "approvalStatus", "siteId",
            "referenceId", "referenceCode", "requestedAt", "requestedByName", "approverRoleCode"
    );
    private static final Set<String> APPROVAL_HISTORY_SORTS = Set.of(
            "moduleCode", "actionCode", "referenceId", "referenceCode", "siteName",
            "requestedByName", "requestedAt", "approvalStatus", "approverRoleCode",
            "createdAt", "updatedAt"
    );

    public ApprovalWorkflowService(@Value("${cmms.approval.enabled:false}") boolean globalApprovalEnabled,
                                   ApprovalConfigDAO approvalConfigDAO,
                                   ApprovalRequestDAO approvalRequestDAO,
                                   ApprovalActionDAO approvalActionDAO,
                                   MaintenanceRequestDAO maintenanceRequestDAO,
                                   PreventiveMaintenanceScheduleDAO scheduleDAO,
                                   AccessControlService accessControlService,
                                   ObjectProvider<PreventiveMaintenanceScheduleService> scheduleServiceProvider,
                                   ObjectProvider<MaintenanceSpareUsageService> spareUsageServiceProvider,
                                   ObjectMapper objectMapper,
                                   NotificationService notificationService) {
        this.globalApprovalEnabled = globalApprovalEnabled;
        this.approvalConfigDAO = approvalConfigDAO;
        this.approvalRequestDAO = approvalRequestDAO;
        this.approvalActionDAO = approvalActionDAO;
        this.maintenanceRequestDAO = maintenanceRequestDAO;
        this.scheduleDAO = scheduleDAO;
        this.accessControlService = accessControlService;
        this.scheduleServiceProvider = scheduleServiceProvider;
        this.spareUsageServiceProvider = spareUsageServiceProvider;
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public boolean isApprovalEnabled(String moduleCode, String actionCode) {
        if (!globalApprovalEnabled) {
            return false;
        }
        return approvalConfigDAO.findActive(normalize(moduleCode), normalize(actionCode))
                .map((config) -> Boolean.TRUE.equals(config.getApprovalRequired()))
                .orElse(false);
    }

    public ApprovalRequestDTO createApprovalRequest(String moduleCode,
                                                    String actionCode,
                                                    Long referenceId,
                                                    String referenceCode,
                                                    Site site,
                                                    Object payload,
                                                    String remarks) {
        ApprovalConfig config = approvalConfigDAO.findActive(normalize(moduleCode), normalize(actionCode))
                .orElseThrow(() -> new InvalidOperationException("Approval config not found for " + moduleCode + " / " + actionCode));
        if (!Boolean.TRUE.equals(config.getApprovalRequired())) {
            return null;
        }
        accessControlService.validateSiteAccess(site == null ? null : site.getId());
        ApprovalRequest request = new ApprovalRequest();
        request.setModuleCode(config.getModuleCode());
        request.setActionCode(config.getActionCode());
        request.setReferenceId(referenceId);
        request.setReferenceCode(referenceCode);
        request.setSite(site);
        request.setRequestedBy(accessControlService.getCurrentUser());
        request.setApproverRoleCode(config.getApproverRoleCode());
        request.setMinApprovalCount(config.getMinApprovalCount() == null || config.getMinApprovalCount() < 1 ? 1 : config.getMinApprovalCount());
        request.setRemarks(remarks);
        request.setPayloadJson(toJson(payload));
        ApprovalRequest saved = approvalRequestDAO.save(request);
        notificationService.createApprovalPendingAlert(saved);
        return toDTO(saved, true);
    }

    public ApprovalRequestDTO approve(Long approvalRequestId, String comments) {
        accessControlService.validatePermission("APPROVAL_APPROVE");
        ApprovalRequest request = getPendingRequest(approvalRequestId);
        validateApproverPermission(request, "APPROVAL_APPROVE");
        saveAction(request, "APPROVED", comments);
        request.setApprovedCount((int) approvalActionDAO.countByApprovalRequestIdAndActionStatus(request.getId(), "APPROVED"));
        if (request.getApprovedCount() >= request.getMinApprovalCount()) {
            request.setApprovalStatus("APPROVED");
            applyApprovedBusinessAction(request);
        }
        return toDTO(approvalRequestDAO.save(request), true);
    }

    public ApprovalRequestDTO reject(Long approvalRequestId, String comments) {
        accessControlService.validatePermission("APPROVAL_REJECT");
        ApprovalRequest request = getPendingRequest(approvalRequestId);
        validateApproverPermission(request, "APPROVAL_REJECT");
        saveAction(request, "REJECTED", comments);
        request.setRejectedCount((int) approvalActionDAO.countByApprovalRequestIdAndActionStatus(request.getId(), "REJECTED"));
        request.setApprovalStatus("REJECTED");
        applyRejectedBusinessAction(request);
        return toDTO(approvalRequestDAO.save(request), true);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestDTO> getPendingApprovalsForCurrentUser() {
        accessControlService.validatePermission("APPROVAL_VIEW");
        List<ApprovalRequest> requests = accessControlService.isAdmin()
                ? approvalRequestDAO.findPending()
                : approvalRequestDAO.findPendingBySiteIds(accessControlService.getAllowedSiteIds());
        return requests.stream()
                .filter(this::canCurrentUserActOnRole)
                .map((request) -> toDTO(request, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestDTO> getApprovalHistory(String moduleCode, Long referenceId) {
        accessControlService.validatePermission("APPROVAL_VIEW");
        if (moduleCode == null || moduleCode.isBlank() || referenceId == null) {
            throw new InvalidOperationException("Module code and reference id are required");
        }
        List<ApprovalRequest> requests = accessControlService.isAdmin()
                ? approvalRequestDAO.findHistory(normalize(moduleCode), referenceId)
                : approvalRequestDAO.findHistoryBySiteIds(accessControlService.getAllowedSiteIds(), normalize(moduleCode), referenceId);
        requests.forEach((request) -> accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId()));
        return requests.stream().map((request) -> toDTO(request, true)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageProperties searchApprovalHistory(SearchDTO searchDTO) {
        accessControlService.validatePermission("APPROVAL_VIEW");
        SearchDTO effectiveSearch = prepareApprovalHistorySearch(searchDTO);
        Page<ApprovalRequestDTO> page = approvalRequestDAO.search(
                        buildApprovalHistorySpecification(effectiveSearch),
                        buildApprovalHistoryPageable(effectiveSearch.getPagination()))
                .map((request) -> toDTO(request, false));
        return new PageProperties(page.getContent(), page.getTotalElements(), page.getNumber(), page.getSize(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ApprovalRequestDTO getApprovalRequest(Long approvalRequestId) {
        accessControlService.validatePermission("APPROVAL_VIEW");
        ApprovalRequest request = approvalRequestDAO.findById(approvalRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request not found with id: " + approvalRequestId));
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        return toDTO(request, true);
    }

    public void validateApproverPermission(ApprovalRequest request, String permissionCode) {
        accessControlService.validatePermission(permissionCode);
        accessControlService.validateSiteAccess(request.getSite() == null ? null : request.getSite().getId());
        if (!canCurrentUserActOnRole(request)) {
            throw new InvalidOperationException("Current user is not an approver for this request");
        }
    }

    private ApprovalRequest getPendingRequest(Long approvalRequestId) {
        ApprovalRequest request = approvalRequestDAO.findById(approvalRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request not found with id: " + approvalRequestId));
        if (!"PENDING".equalsIgnoreCase(request.getApprovalStatus())) {
            throw new InvalidOperationException("Approval request is not pending");
        }
        return request;
    }

    private void saveAction(ApprovalRequest request, String status, String comments) {
        User currentUser = accessControlService.getCurrentUser();
        if (approvalActionDAO.existsByApprovalRequestIdAndApproverUserId(request.getId(), currentUser.getId())) {
            throw new InvalidOperationException("You have already acted on this approval request");
        }
        ApprovalAction action = new ApprovalAction();
        action.setApprovalRequest(request);
        action.setApproverUser(currentUser);
        action.setActionStatus(status);
        action.setComments(comments);
        approvalActionDAO.save(action);
    }

    private boolean canCurrentUserActOnRole(ApprovalRequest request) {
        if (accessControlService.isAdmin()) {
            return true;
        }
        String approverRoleCode = request.getApproverRoleCode();
        if (approverRoleCode == null || approverRoleCode.isBlank()) {
            return true;
        }
        Set<String> roles = accessControlService.getRoles();
        return roles.contains(approverRoleCode);
    }

    private SearchDTO prepareApprovalHistorySearch(SearchDTO searchDTO) {
        SearchDTO effectiveSearch = new SearchDTO();
        effectiveSearch.setDataOption("all");
        effectiveSearch.setSearchCriteriaList(normalizeApprovalHistoryCriteria(searchDTO));
        effectiveSearch.setPagination(normalizeApprovalHistoryPagination(searchDTO == null ? null : searchDTO.getPagination()));
        applyApprovalHistorySiteAccess(effectiveSearch);
        return effectiveSearch;
    }

    private List<SearchCriteriaDTO> normalizeApprovalHistoryCriteria(SearchDTO searchDTO) {
        List<SearchCriteriaDTO> normalized = new ArrayList<>();
        if (searchDTO == null || searchDTO.getSearchCriteriaList() == null) {
            return normalized;
        }
        for (SearchCriteriaDTO criteria : searchDTO.getSearchCriteriaList()) {
            if (criteria == null || isBlank(criteria.getFilterKey()) || isEmptyValue(criteria.getValue())) {
                continue;
            }
            if (!APPROVAL_HISTORY_FILTERS.contains(criteria.getFilterKey())) {
                throw new InvalidOperationException("Unsupported approval history filter: " + criteria.getFilterKey());
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

    private PagePropertiesDTO normalizeApprovalHistoryPagination(PagePropertiesDTO pagination) {
        PagePropertiesDTO normalized = new PagePropertiesDTO();
        normalized.setStatus(pagination == null ? "ON" : pagination.getStatus());
        normalized.setRecordsPerPage(pagination == null || pagination.getRecordsPerPage() == null ? 10 : pagination.getRecordsPerPage());
        normalized.setPageNumber(pagination == null || pagination.getPageNumber() == null ? 0 : pagination.getPageNumber());
        normalized.setPageSize(pagination == null ? 0 : pagination.getPageSize());
        String sortBy = pagination == null ? null : pagination.getSortBy();
        normalized.setSortBy(APPROVAL_HISTORY_SORTS.contains(sortBy) ? sortBy : "requestedAt");
        normalized.setSortMode("ASC".equalsIgnoreCase(pagination == null ? null : pagination.getSortMode()) ? "ASC" : "DESC");
        return normalized;
    }

    private void applyApprovalHistorySiteAccess(SearchDTO searchDTO) {
        SearchCriteriaDTO siteCriteria = findCriterion(searchDTO.getSearchCriteriaList(), "siteId");
        if (siteCriteria != null) {
            accessControlService.validateAnySiteAccess(toLongValues(siteCriteria.getValue()));
            return;
        }
        if (accessControlService.isAdmin()) {
            return;
        }
        List<Long> allowedSiteIds = accessControlService.getAllowedSiteIds();
        if (!allowedSiteIds.isEmpty()) {
            SearchCriteriaDTO criteria = new SearchCriteriaDTO();
            criteria.setFilterKey("siteId");
            criteria.setDataType("NUMBER");
            criteria.setValue(allowedSiteIds);
            criteria.setOperation("in");
            searchDTO.getSearchCriteriaList().add(criteria);
        }
    }

    private Specification<ApprovalRequest> buildApprovalHistorySpecification(SearchDTO searchDTO) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<ApprovalRequest, Site> siteJoin = root.join("site", JoinType.LEFT);
            Join<ApprovalRequest, User> requestedByJoin = root.join("requestedBy", JoinType.LEFT);
            for (SearchCriteriaDTO criteria : searchDTO.getSearchCriteriaList()) {
                String filterKey = criteria.getFilterKey();
                Object value = criteria.getValue();
                String operation = criteria.getOperation();
                if ("commonSearch".equals(filterKey)) {
                    String like = "%" + value.toString().trim().toLowerCase(Locale.ROOT) + "%";
                    predicates.add(criteriaBuilder.or(
                            criteriaBuilder.like(lowerString(root.get("moduleCode"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(root.get("actionCode"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(root.get("referenceCode"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(root.get("approvalStatus"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(root.get("approverRoleCode"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(root.get("remarks"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(siteJoin.get("siteName"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(requestedByJoin.get("firstName"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(requestedByJoin.get("lastName"), criteriaBuilder), like)
                    ));
                } else if ("siteId".equals(filterKey)) {
                    predicates.add(sitePredicate(siteJoin.get("id"), value, operation, criteriaBuilder));
                } else if ("requestedAt".equals(filterKey)) {
                    predicates.add(dateTimePredicate(root.get("requestedAt"), value, operation, criteriaBuilder));
                } else if ("requestedByName".equals(filterKey)) {
                    String like = "%" + value.toString().trim().toLowerCase(Locale.ROOT) + "%";
                    predicates.add(criteriaBuilder.or(
                            criteriaBuilder.like(lowerString(requestedByJoin.get("firstName"), criteriaBuilder), like),
                            criteriaBuilder.like(lowerString(requestedByJoin.get("lastName"), criteriaBuilder), like)
                    ));
                } else {
                    predicates.add(simplePredicate(root.get(filterKey), value, operation, criteriaBuilder));
                }
            }
            applyApprovalHistorySort(root, siteJoin, requestedByJoin, query, criteriaBuilder, searchDTO.getPagination());
            return predicates.isEmpty() ? criteriaBuilder.conjunction() : criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Pageable buildApprovalHistoryPageable(PagePropertiesDTO pagination) {
        int pageNumber = Math.max(0, pagination.getPageNumber() == null ? 0 : pagination.getPageNumber());
        int pageSize = Math.min(Math.max(1, pagination.getRecordsPerPage() == null ? 10 : pagination.getRecordsPerPage()), 100);
        return PageRequest.of(pageNumber, pageSize);
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private Predicate simplePredicate(jakarta.persistence.criteria.Path<?> path,
                                      Object value,
                                      String operation,
                                      jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        if ("contains".equals(operation)) {
            return criteriaBuilder.like(criteriaBuilder.lower(path.as(String.class)), "%" + value.toString().trim().toLowerCase(Locale.ROOT) + "%");
        }
        if ("in".equals(operation)) {
            jakarta.persistence.criteria.CriteriaBuilder.In<Object> inClause = criteriaBuilder.in(path);
            toValueList(value).forEach((item) -> inClause.value(convertValue(item, path.getJavaType())));
            return inClause;
        }
        if ("gte".equals(operation) || "gt".equals(operation) || "lte".equals(operation) || "lt".equals(operation)) {
            Comparable converted = (Comparable) convertValue(value, path.getJavaType());
            jakarta.persistence.criteria.Expression<? extends Comparable> expression = path.as((Class<? extends Comparable>) path.getJavaType());
            if ("gte".equals(operation)) return criteriaBuilder.greaterThanOrEqualTo(expression, converted);
            if ("gt".equals(operation)) return criteriaBuilder.greaterThan(expression, converted);
            if ("lte".equals(operation)) return criteriaBuilder.lessThanOrEqualTo(expression, converted);
            return criteriaBuilder.lessThan(expression, converted);
        }
        Object converted = convertValue(value, path.getJavaType());
        if (String.class.equals(path.getJavaType())) {
            return criteriaBuilder.equal(criteriaBuilder.lower(path.as(String.class)), converted.toString().toLowerCase(Locale.ROOT));
        }
        return criteriaBuilder.equal(path, converted);
    }

    private Predicate sitePredicate(jakarta.persistence.criteria.Path<Long> path,
                                    Object value,
                                    String operation,
                                    jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        if ("in".equals(operation)) {
            jakarta.persistence.criteria.CriteriaBuilder.In<Long> inClause = criteriaBuilder.in(path);
            toLongValues(value).forEach(inClause::value);
            return inClause;
        }
        return criteriaBuilder.equal(path, Long.valueOf(value.toString().trim()));
    }

    private jakarta.persistence.criteria.Expression<String> lowerString(jakarta.persistence.criteria.Path<?> path,
                                                                        jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        return criteriaBuilder.lower(path.as(String.class));
    }

    private Predicate dateTimePredicate(jakarta.persistence.criteria.Path<LocalDateTime> path,
                                        Object value,
                                        String operation,
                                        jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        LocalDateTime dateTime = LocalDateTime.parse(value.toString().trim());
        if ("gte".equals(operation)) {
            return criteriaBuilder.greaterThanOrEqualTo(path, dateTime);
        }
        if ("gt".equals(operation)) {
            return criteriaBuilder.greaterThan(path, dateTime);
        }
        if ("lte".equals(operation)) {
            return criteriaBuilder.lessThanOrEqualTo(path, dateTime);
        }
        if ("lt".equals(operation)) {
            return criteriaBuilder.lessThan(path, dateTime);
        }
        return criteriaBuilder.equal(path, dateTime);
    }

    private void applyApprovalHistorySort(jakarta.persistence.criteria.Root<ApprovalRequest> root,
                                          Join<ApprovalRequest, Site> siteJoin,
                                          Join<ApprovalRequest, User> requestedByJoin,
                                          jakarta.persistence.criteria.CriteriaQuery<?> query,
                                          jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
                                          PagePropertiesDTO pagination) {
        Class<?> resultType = query.getResultType();
        if (Long.class.equals(resultType) || long.class.equals(resultType)) {
            return;
        }
        String sortBy = pagination.getSortBy();
        boolean ascending = "ASC".equalsIgnoreCase(pagination.getSortMode());
        jakarta.persistence.criteria.Expression<?> expression;
        if ("siteName".equals(sortBy)) {
            expression = siteJoin.get("siteName");
        } else if ("requestedByName".equals(sortBy)) {
            expression = requestedByJoin.get("firstName");
        } else {
            expression = root.get(sortBy);
        }
        query.orderBy(ascending ? criteriaBuilder.asc(expression) : criteriaBuilder.desc(expression));
    }

    private SearchCriteriaDTO findCriterion(List<SearchCriteriaDTO> criteriaList, String filterKey) {
        return criteriaList.stream()
                .filter((criteria) -> filterKey.equals(criteria.getFilterKey()))
                .findFirst()
                .orElse(null);
    }

    private List<Object> toValueList(Object value) {
        if (value instanceof Collection<?> collection) {
            return new ArrayList<>(collection);
        }
        return new ArrayList<>(Arrays.asList(value.toString().split(",")));
    }

    private List<Long> toLongValues(Object value) {
        Collection<?> values = value instanceof Collection<?> collection
                ? collection
                : Arrays.asList(value.toString().split(","));
        Set<Long> ids = new LinkedHashSet<>();
        for (Object item : values) {
            if (!isEmptyValue(item)) {
                ids.add(Long.valueOf(item.toString().trim()));
            }
        }
        return new ArrayList<>(ids);
    }

    private Object convertValue(Object value, Class<?> javaType) {
        String text = value.toString().trim();
        if (Long.class.equals(javaType)) {
            return Long.valueOf(text);
        }
        if (Integer.class.equals(javaType)) {
            return Integer.valueOf(text);
        }
        if (LocalDateTime.class.equals(javaType)) {
            return LocalDateTime.parse(text);
        }
        return text;
    }

    private String normalizeOperation(String operation) {
        if (operation == null || operation.isBlank()) {
            return "equal";
        }
        String normalized = operation.trim().toLowerCase(Locale.ROOT);
        if ("greater_than_equal".equals(normalized)) return "gte";
        if ("less_than_equal".equals(normalized)) return "lte";
        if ("greater_than".equals(normalized)) return "gt";
        if ("less_than".equals(normalized)) return "lt";
        if ("like".equals(normalized)) return "contains";
        return normalized;
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

    private void applyApprovedBusinessAction(ApprovalRequest request) {
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CREATE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus("OPEN");
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CLOSE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus("CLOSED");
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (PM_SCHEDULE.equals(request.getModuleCode()) && (CREATE.equals(request.getActionCode()) || UPDATE.equals(request.getActionCode()))) {
            PreventiveMaintenanceSchedule schedule = getSchedule(request.getReferenceId());
            schedule.setStatus("APPROVED");
            schedule.setActive(true);
            scheduleDAO.save(schedule);
            return;
        }
        if (PM_WORK_ORDER.equals(request.getModuleCode()) && GENERATE.equals(request.getActionCode())) {
            scheduleServiceProvider.getObject().generateWorkOrderImmediately(request.getReferenceId());
            return;
        }
        if (SPARE_ISSUE.equals(request.getModuleCode()) && (RESERVE.equals(request.getActionCode()) || ISSUE.equals(request.getActionCode()))) {
            spareUsageServiceProvider.getObject().completeApprovedTransition(request.getReferenceId(), request.getActionCode());
        }
    }

    private void applyRejectedBusinessAction(ApprovalRequest request) {
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CREATE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus("REJECTED");
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (MAINTENANCE_REQUEST.equals(request.getModuleCode()) && CLOSE.equals(request.getActionCode())) {
            MaintenanceRequest maintenanceRequest = getMaintenanceRequest(request.getReferenceId());
            maintenanceRequest.setStatus(previousStatus(request.getPayloadJson(), "IN_PROGRESS"));
            maintenanceRequestDAO.save(maintenanceRequest);
            return;
        }
        if (PM_SCHEDULE.equals(request.getModuleCode()) && (CREATE.equals(request.getActionCode()) || UPDATE.equals(request.getActionCode()))) {
            PreventiveMaintenanceSchedule schedule = getSchedule(request.getReferenceId());
            schedule.setStatus("REJECTED");
            schedule.setActive(false);
            scheduleDAO.save(schedule);
            return;
        }
        if (PM_WORK_ORDER.equals(request.getModuleCode()) && GENERATE.equals(request.getActionCode())) {
            PreventiveMaintenanceSchedule schedule = getSchedule(request.getReferenceId());
            schedule.setLastNotificationStatus("WORK_ORDER_GENERATION_REJECTED");
            scheduleDAO.save(schedule);
            return;
        }
        if (SPARE_ISSUE.equals(request.getModuleCode()) && (RESERVE.equals(request.getActionCode()) || ISSUE.equals(request.getActionCode()))) {
            spareUsageServiceProvider.getObject().completeRejectedTransition(request.getReferenceId(), request.getActionCode());
        }
    }

    private MaintenanceRequest getMaintenanceRequest(Long id) {
        return maintenanceRequestDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private PreventiveMaintenanceSchedule getSchedule(Long id) {
        return scheduleDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PM schedule not found with id: " + id));
    }

    private String previousStatus(String payloadJson, String fallback) {
        try {
            JsonNode node = objectMapper.readTree(payloadJson);
            String previous = node.path("previousStatus").asText(null);
            return previous == null || previous.isBlank() ? fallback : previous;
        } catch (Exception ex) {
            return fallback;
        }
    }

    private String toJson(Object payload) {
        try {
            Object effectivePayload = payload == null ? Map.of() : payload;
            return objectMapper.writeValueAsString(effectivePayload);
        } catch (Exception ex) {
            throw new InvalidOperationException("Unable to serialize approval payload");
        }
    }

    private ApprovalRequestDTO toDTO(ApprovalRequest request, boolean includeActions) {
        ApprovalRequestDTO dto = new ApprovalRequestDTO();
        dto.setId(request.getId());
        dto.setModuleCode(request.getModuleCode());
        dto.setActionCode(request.getActionCode());
        dto.setReferenceId(request.getReferenceId());
        dto.setReferenceCode(request.getReferenceCode());
        dto.setSiteId(request.getSite() == null ? null : request.getSite().getId());
        dto.setSiteName(request.getSite() == null ? null : request.getSite().getSiteName());
        dto.setRequestedById(request.getRequestedBy() == null ? null : request.getRequestedBy().getId());
        dto.setRequestedByName(userName(request.getRequestedBy()));
        dto.setRequestedAt(request.getRequestedAt());
        dto.setApprovalStatus(request.getApprovalStatus());
        dto.setApproverRoleCode(request.getApproverRoleCode());
        dto.setMinApprovalCount(request.getMinApprovalCount());
        dto.setApprovedCount(request.getApprovedCount());
        dto.setRejectedCount(request.getRejectedCount());
        dto.setRemarks(request.getRemarks());
        dto.setPayloadJson(request.getPayloadJson());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        if (includeActions) {
            dto.setActions(approvalActionDAO.findByApprovalRequestId(request.getId()).stream()
                    .map(this::toActionDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ApprovalActionDTO toActionDTO(ApprovalAction action) {
        ApprovalActionDTO dto = new ApprovalActionDTO();
        dto.setId(action.getId());
        dto.setApprovalRequestId(action.getApprovalRequest() == null ? null : action.getApprovalRequest().getId());
        dto.setApproverUserId(action.getApproverUser() == null ? null : action.getApproverUser().getId());
        dto.setApproverName(userName(action.getApproverUser()));
        dto.setActionStatus(action.getActionStatus());
        dto.setComments(action.getComments());
        dto.setActionAt(action.getActionAt());
        return dto;
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toUpperCase(Locale.ROOT);
    }
}
