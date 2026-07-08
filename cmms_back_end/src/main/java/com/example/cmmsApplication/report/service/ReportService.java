package com.example.cmmsApplication.report.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.report.dto.DowntimeAnalysisPageDTO;
import com.example.cmmsApplication.report.dto.DowntimeAnalysisRowDTO;
import com.example.cmmsApplication.report.dto.DowntimeAnalysisSummaryDTO;
import com.example.cmmsApplication.report.dto.EquipmentCostGroupRowDTO;
import com.example.cmmsApplication.report.dto.EquipmentCostReportDTO;
import com.example.cmmsApplication.report.dto.EquipmentCostRowDTO;
import com.example.cmmsApplication.report.dto.EquipmentCostSummaryDTO;
import com.example.cmmsApplication.report.dto.EquipmentHistoryRowDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.equipment.repository.EquipmentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    private final EntityManager entityManager;
    private final AccessControlService accessControlService;
    private final EquipmentRepository equipmentRepository;

    public PageProperties getEquipmentHistory(Long equipmentId, Long siteId, Integer page, Integer size) {
        validateReportAccess(equipmentId, siteId);

        int pageNumber = normalizePage(page);
        int pageSize = normalizeSize(size);
        ReportFilter filter = buildFilter(equipmentId, siteId);
        String unionSql = equipmentHistoryUnionSql(filter);
        Map<String, Object> params = filter.params();

        Query countQuery = entityManager.createNativeQuery("SELECT COUNT(*) FROM (" + unionSql + ") history");
        applyParams(countQuery, params);
        long totalRecords = toLong(countQuery.getSingleResult());

        Query dataQuery = entityManager.createNativeQuery(
                "SELECT * FROM (" + unionSql + ") history ORDER BY event_date DESC NULLS LAST, id DESC");
        applyParams(dataQuery, params);
        dataQuery.setFirstResult(pageNumber * pageSize);
        dataQuery.setMaxResults(pageSize);

        @SuppressWarnings("unchecked")
        List<Object[]> resultRows = dataQuery.getResultList();
        List<EquipmentHistoryRowDTO> rows = resultRows.stream().map(this::toEquipmentHistoryRow).toList();
        return new PageProperties(rows, totalRecords, pageNumber, pageSize, totalPages(totalRecords, pageSize));
    }

    public DowntimeAnalysisPageDTO getDowntimeAnalysis(Long equipmentId, Long siteId, Integer page, Integer size) {
        validateReportAccess(equipmentId, siteId);

        int pageNumber = normalizePage(page);
        int pageSize = normalizeSize(size);
        ReportFilter filter = buildFilter(equipmentId, siteId);
        String whereSql = downtimeWhereSql(filter);
        Map<String, Object> params = filter.params();

        String groupedSql = """
                SELECT
                    d.equipment_id AS equipment_id,
                    e.equipment_code AS equipment_code,
                    e.equipment_name AS equipment_name,
                    d.site_id AS site_id,
                    s.site_code AS site_code,
                    s.site_name AS site_name,
                    COUNT(*) AS events,
                    COALESCE(SUM(CASE WHEN d.planned IS TRUE THEN 1 ELSE 0 END), 0) AS planned_events,
                    COALESCE(SUM(d.downtime_minutes), 0) AS total_minutes
                FROM equipment_downtime d
                LEFT JOIN equipment_master e ON e.id = d.equipment_id
                LEFT JOIN site_master s ON s.site_id = d.site_id
                """ + whereSql + """
                GROUP BY d.equipment_id, e.equipment_code, e.equipment_name, d.site_id, s.site_code, s.site_name
                """;

        Query countQuery = entityManager.createNativeQuery("SELECT COUNT(*) FROM (" + groupedSql + ") grouped");
        applyParams(countQuery, params);
        long totalRecords = toLong(countQuery.getSingleResult());

        Query dataQuery = entityManager.createNativeQuery(groupedSql + " ORDER BY total_minutes DESC, events DESC, equipment_name ASC");
        applyParams(dataQuery, params);
        dataQuery.setFirstResult(pageNumber * pageSize);
        dataQuery.setMaxResults(pageSize);

        @SuppressWarnings("unchecked")
        List<Object[]> resultRows = dataQuery.getResultList();
        List<DowntimeAnalysisRowDTO> rows = resultRows.stream().map(this::toDowntimeAnalysisRow).toList();
        PageProperties pageProperties = new PageProperties(rows, totalRecords, pageNumber, pageSize, totalPages(totalRecords, pageSize));
        return new DowntimeAnalysisPageDTO(pageProperties, getDowntimeSummary(whereSql, params));
    }

    public EquipmentCostReportDTO getEquipmentMaintenanceCost(Long equipmentId, Long siteId, Integer page, Integer size) {
        validateReportAccess(equipmentId, siteId);

        int pageNumber = normalizePage(page);
        int pageSize = normalizeSize(size);
        ReportFilter filter = buildFilter(equipmentId, siteId);
        String baseSql = equipmentCostBaseSql(filter);
        Map<String, Object> params = filter.params();

        Query countQuery = entityManager.createNativeQuery("SELECT COUNT(*) FROM (" + baseSql + ") cost");
        applyParams(countQuery, params);
        long totalRecords = toLong(countQuery.getSingleResult());

        Query dataQuery = entityManager.createNativeQuery(baseSql + " ORDER BY total_cost_of_ownership DESC, equipment_name ASC");
        applyParams(dataQuery, params);
        dataQuery.setFirstResult(pageNumber * pageSize);
        dataQuery.setMaxResults(pageSize);

        @SuppressWarnings("unchecked")
        List<Object[]> resultRows = dataQuery.getResultList();
        List<EquipmentCostRowDTO> rows = resultRows.stream().map(this::toEquipmentCostRow).toList();
        PageProperties pageProperties = new PageProperties(rows, totalRecords, pageNumber, pageSize, totalPages(totalRecords, pageSize));
        return new EquipmentCostReportDTO(pageProperties, getEquipmentCostSummary(baseSql, params));
    }

    public EquipmentCostReportDTO getEquipmentCostByGroup(String groupBy, Long siteId, Integer page, Integer size) {
        validateReportAccess(null, siteId);

        int pageNumber = normalizePage(page);
        int pageSize = normalizeSize(size);
        ReportFilter filter = buildFilter(null, siteId);
        String baseSql = equipmentCostBaseSql(filter);
        GroupByDefinition group = groupByDefinition(groupBy);
        Map<String, Object> params = filter.params();
        String groupedSql = """
                SELECT
                    %s AS group_key,
                    %s AS group_name,
                    COUNT(*) AS asset_count,
                    COALESCE(SUM(purchase_cost), 0) AS purchase_cost,
                    COALESCE(SUM(maintenance_cost), 0) AS maintenance_cost,
                    COALESCE(SUM(spare_material_cost), 0) AS spare_material_cost,
                    COALESCE(SUM(downtime_cost), 0) AS downtime_cost,
                    COALESCE(SUM(total_cost_of_ownership), 0) AS total_cost_of_ownership
                FROM (%s) cost
                GROUP BY %s, %s
                """.formatted(group.keyExpression(), group.nameExpression(), baseSql, group.keyExpression(), group.nameExpression());

        Query countQuery = entityManager.createNativeQuery("SELECT COUNT(*) FROM (" + groupedSql + ") grouped_cost");
        applyParams(countQuery, params);
        long totalRecords = toLong(countQuery.getSingleResult());

        Query dataQuery = entityManager.createNativeQuery(groupedSql + " ORDER BY total_cost_of_ownership DESC, group_name ASC");
        applyParams(dataQuery, params);
        dataQuery.setFirstResult(pageNumber * pageSize);
        dataQuery.setMaxResults(pageSize);

        @SuppressWarnings("unchecked")
        List<Object[]> resultRows = dataQuery.getResultList();
        List<EquipmentCostGroupRowDTO> rows = resultRows.stream().map(this::toEquipmentCostGroupRow).toList();
        PageProperties pageProperties = new PageProperties(rows, totalRecords, pageNumber, pageSize, totalPages(totalRecords, pageSize));
        return new EquipmentCostReportDTO(pageProperties, getEquipmentCostSummary(baseSql, params));
    }

    private void validateReportAccess(Long equipmentId, Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        if (equipmentId != null) {
            Equipment equipment = equipmentRepository.findById(equipmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + equipmentId));
            accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        }
    }

    private ReportFilter buildFilter(Long equipmentId, Long siteId) {
        Map<String, Object> params = new HashMap<>();
        String siteCondition = "";
        String equipmentCondition = "";

        if (equipmentId != null) {
            params.put("equipmentId", equipmentId);
            equipmentCondition = "equipment";
        }

        if (siteId != null) {
            params.put("siteId", siteId);
            siteCondition = "site";
        } else if (!accessControlService.isAdmin()) {
            List<Long> allowedSiteIds = accessControlService.getAllowedSiteIds();
            if (allowedSiteIds.isEmpty()) {
                siteCondition = "none";
            } else {
                params.put("siteIds", allowedSiteIds);
                siteCondition = "allowedSites";
            }
        }

        return new ReportFilter(siteCondition, equipmentCondition, params);
    }

    private String equipmentHistoryUnionSql(ReportFilter filter) {
        return """
                SELECT
                    CONCAT('REQ-', mr.id) AS id,
                    mr.equipment_id AS equipment_id,
                    e.equipment_code AS equipment_code,
                    e.equipment_name AS equipment_name,
                    mr.site_id AS site_id,
                    s.site_code AS site_code,
                    s.site_name AS site_name,
                    'Request' AS type,
                    mr.request_number AS reference,
                    mr.title AS detail,
                    mr.status AS status,
                    CAST(mr.requested_date AS TIMESTAMP) AS event_date
                FROM maintenance_request mr
                LEFT JOIN equipment_master e ON e.id = mr.equipment_id
                LEFT JOIN site_master s ON s.site_id = mr.site_id
                """ + whereSql(filter, "mr.site_id", "mr.equipment_id") + """
                UNION ALL
                SELECT
                    CONCAT('ASN-', ma.id) AS id,
                    mr.equipment_id AS equipment_id,
                    e.equipment_code AS equipment_code,
                    e.equipment_name AS equipment_name,
                    mr.site_id AS site_id,
                    s.site_code AS site_code,
                    s.site_name AS site_name,
                    'Assignment' AS type,
                    mr.request_number AS reference,
                    COALESCE(NULLIF(ma.assigned_to, ''), v.vendor_name, 'Unassigned') AS detail,
                    ma.status AS status,
                    CAST(ma.assigned_date AS TIMESTAMP) AS event_date
                FROM maintenance_assignment ma
                JOIN maintenance_request mr ON mr.id = ma.request_id
                LEFT JOIN equipment_master e ON e.id = mr.equipment_id
                LEFT JOIN site_master s ON s.site_id = mr.site_id
                LEFT JOIN vendor_master v ON v.id = ma.vendor_id
                """ + whereSql(filter, "mr.site_id", "mr.equipment_id") + """
                UNION ALL
                SELECT
                    CONCAT('DT-', d.id) AS id,
                    d.equipment_id AS equipment_id,
                    e.equipment_code AS equipment_code,
                    e.equipment_name AS equipment_name,
                    d.site_id AS site_id,
                    s.site_code AS site_code,
                    s.site_name AS site_name,
                    'Downtime' AS type,
                    COALESCE(mr.request_number, '-') AS reference,
                    d.reason AS detail,
                    CONCAT(COALESCE(d.downtime_minutes, 0), ' minutes') AS status,
                    d.downtime_start AS event_date
                FROM equipment_downtime d
                LEFT JOIN equipment_master e ON e.id = d.equipment_id
                LEFT JOIN site_master s ON s.site_id = d.site_id
                LEFT JOIN maintenance_request mr ON mr.id = d.request_id
                """ + whereSql(filter, "d.site_id", "d.equipment_id");
    }

    private String downtimeWhereSql(ReportFilter filter) {
        return whereSql(filter, "d.site_id", "d.equipment_id");
    }

    private String equipmentCostBaseSql(ReportFilter filter) {
        return """
                SELECT
                    e.id AS equipment_id,
                    e.equipment_code AS equipment_code,
                    e.equipment_name AS equipment_name,
                    e.site_id AS site_id,
                    s.site_code AS site_code,
                    s.site_name AS site_name,
                    e.category AS category,
                    e.criticality AS criticality,
                    e.asset_number AS asset_number,
                    e.cost_center AS cost_center,
                    e.department AS department,
                    COALESCE(e.purchase_cost, 0) AS purchase_cost,
                    COALESCE(assignment_cost.maintenance_cost, 0) AS maintenance_cost,
                    COALESCE(spare_cost.spare_material_cost, 0) AS spare_material_cost,
                    CAST(0 AS DECIMAL(14,2)) AS downtime_cost,
                    COALESCE(e.purchase_cost, 0)
                        + COALESCE(assignment_cost.maintenance_cost, 0)
                        + COALESCE(spare_cost.spare_material_cost, 0) AS total_cost_of_ownership
                FROM equipment_master e
                LEFT JOIN site_master s ON s.site_id = e.site_id
                LEFT JOIN (
                    SELECT
                        mr.equipment_id,
                        SUM(COALESCE(ma.actual_cost, ma.estimated_cost, 0)) AS maintenance_cost
                    FROM maintenance_assignment ma
                    JOIN maintenance_request mr ON mr.id = ma.request_id
                    WHERE UPPER(COALESCE(ma.status, '')) <> 'CANCELLED'
                    GROUP BY mr.equipment_id
                ) assignment_cost ON assignment_cost.equipment_id = e.id
                LEFT JOIN (
                    SELECT
                        mr.equipment_id,
                        SUM(COALESCE(msu.total_cost, 0)) AS spare_material_cost
                    FROM maintenance_spare_usage msu
                    JOIN maintenance_assignment ma ON ma.id = msu.assignment_id
                    JOIN maintenance_request mr ON mr.id = ma.request_id
                    WHERE UPPER(COALESCE(msu.status, '')) IN ('ISSUED', 'PARTIALLY_CONSUMED', 'CONSUMED', 'RETURNED')
                    GROUP BY mr.equipment_id
                ) spare_cost ON spare_cost.equipment_id = e.id
                """ + whereSql(filter, "e.site_id", "e.id");
    }

    private String whereSql(ReportFilter filter, String siteColumn, String equipmentColumn) {
        StringBuilder where = new StringBuilder(" WHERE 1 = 1");
        if ("site".equals(filter.siteCondition())) {
            where.append(" AND ").append(siteColumn).append(" = :siteId");
        } else if ("allowedSites".equals(filter.siteCondition())) {
            where.append(" AND ").append(siteColumn).append(" IN (:siteIds)");
        } else if ("none".equals(filter.siteCondition())) {
            where.append(" AND 1 = 0");
        }
        if ("equipment".equals(filter.equipmentCondition())) {
            where.append(" AND ").append(equipmentColumn).append(" = :equipmentId");
        }
        where.append("\n");
        return where.toString();
    }

    private DowntimeAnalysisSummaryDTO getDowntimeSummary(String whereSql, Map<String, Object> params) {
        Query query = entityManager.createNativeQuery("""
                SELECT
                    COUNT(*) AS events,
                    COALESCE(SUM(CASE WHEN d.planned IS TRUE THEN 1 ELSE 0 END), 0) AS planned_events,
                    COALESCE(SUM(d.downtime_minutes), 0) AS total_minutes
                FROM equipment_downtime d
                """ + whereSql);
        applyParams(query, params);
        Object[] row = (Object[]) query.getSingleResult();

        long events = toLong(row[0]);
        long plannedEvents = toLong(row[1]);
        long totalMinutes = toLong(row[2]);

        DowntimeAnalysisSummaryDTO summary = new DowntimeAnalysisSummaryDTO();
        summary.setEvents(events);
        summary.setPlannedEvents(plannedEvents);
        summary.setUnplannedEvents(events - plannedEvents);
        summary.setTotalMinutes(totalMinutes);
        summary.setTotalHours(toHours(totalMinutes));
        summary.setTotalDays(toDays(totalMinutes));
        return summary;
    }

    private EquipmentCostSummaryDTO getEquipmentCostSummary(String baseSql, Map<String, Object> params) {
        Query query = entityManager.createNativeQuery("""
                SELECT
                    COUNT(*) AS asset_count,
                    COALESCE(SUM(purchase_cost), 0) AS purchase_cost,
                    COALESCE(SUM(maintenance_cost), 0) AS maintenance_cost,
                    COALESCE(SUM(spare_material_cost), 0) AS spare_material_cost,
                    COALESCE(SUM(downtime_cost), 0) AS downtime_cost,
                    COALESCE(SUM(total_cost_of_ownership), 0) AS total_cost_of_ownership
                FROM (
                """ + baseSql + """
                ) cost
                """);
        applyParams(query, params);
        Object[] row = (Object[]) query.getSingleResult();

        return EquipmentCostSummaryDTO.builder()
                .assetCount(toLong(row[0]))
                .purchaseCost(toMoney(row[1]))
                .maintenanceCost(toMoney(row[2]))
                .spareMaterialCost(toMoney(row[3]))
                .downtimeCost(toMoney(row[4]))
                .totalCostOfOwnership(toMoney(row[5]))
                .build();
    }

    private EquipmentHistoryRowDTO toEquipmentHistoryRow(Object[] row) {
        return new EquipmentHistoryRowDTO(
                toStringValue(row[0]),
                toLongOrNull(row[1]),
                toStringValue(row[2]),
                toStringValue(row[3]),
                toLongOrNull(row[4]),
                toStringValue(row[5]),
                toStringValue(row[6]),
                toStringValue(row[7]),
                toStringValue(row[8]),
                toStringValue(row[9]),
                toStringValue(row[10]),
                toLocalDateTime(row[11])
        );
    }

    private DowntimeAnalysisRowDTO toDowntimeAnalysisRow(Object[] row) {
        long events = toLong(row[6]);
        long plannedEvents = toLong(row[7]);
        long totalMinutes = toLong(row[8]);

        DowntimeAnalysisRowDTO dto = new DowntimeAnalysisRowDTO();
        dto.setEquipmentId(toLongOrNull(row[0]));
        dto.setId(String.valueOf(dto.getEquipmentId() == null ? "unknown-" + toLongOrNull(row[3]) : dto.getEquipmentId()));
        dto.setEquipmentCode(toStringValue(row[1]));
        dto.setEquipmentName(toStringValue(row[2]));
        dto.setSiteId(toLongOrNull(row[3]));
        dto.setSiteCode(toStringValue(row[4]));
        dto.setSiteName(toStringValue(row[5]));
        dto.setEvents(events);
        dto.setPlannedEvents(plannedEvents);
        dto.setUnplannedEvents(events - plannedEvents);
        dto.setTotalMinutes(totalMinutes);
        dto.setTotalHours(toHours(totalMinutes));
        dto.setTotalDays(toDays(totalMinutes));
        return dto;
    }

    private EquipmentCostRowDTO toEquipmentCostRow(Object[] row) {
        Long equipmentId = toLongOrNull(row[0]);
        return EquipmentCostRowDTO.builder()
                .id(equipmentId == null ? "equipment-unknown" : String.valueOf(equipmentId))
                .equipmentId(equipmentId)
                .equipmentCode(toStringValue(row[1]))
                .equipmentName(toStringValue(row[2]))
                .siteId(toLongOrNull(row[3]))
                .siteCode(toStringValue(row[4]))
                .siteName(toStringValue(row[5]))
                .category(toStringValue(row[6]))
                .criticality(toStringValue(row[7]))
                .assetNumber(toStringValue(row[8]))
                .costCenter(toStringValue(row[9]))
                .department(toStringValue(row[10]))
                .purchaseCost(toMoney(row[11]))
                .maintenanceCost(toMoney(row[12]))
                .spareMaterialCost(toMoney(row[13]))
                .downtimeCost(toMoney(row[14]))
                .totalCostOfOwnership(toMoney(row[15]))
                .build();
    }

    private EquipmentCostGroupRowDTO toEquipmentCostGroupRow(Object[] row) {
        String groupKey = toStringValue(row[0]);
        return EquipmentCostGroupRowDTO.builder()
                .id(groupKey == null || groupKey.isBlank() ? "unassigned" : groupKey)
                .groupKey(groupKey)
                .groupName(toStringValue(row[1]))
                .assetCount(toLong(row[2]))
                .purchaseCost(toMoney(row[3]))
                .maintenanceCost(toMoney(row[4]))
                .spareMaterialCost(toMoney(row[5]))
                .downtimeCost(toMoney(row[6]))
                .totalCostOfOwnership(toMoney(row[7]))
                .build();
    }

    private void applyParams(Query query, Map<String, Object> params) {
        params.forEach(query::setParameter);
    }

    private int normalizePage(Integer page) {
        return Math.max(0, page == null ? 0 : page);
    }

    private int normalizeSize(Integer size) {
        if (size == null || size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private int totalPages(long totalRecords, int pageSize) {
        return pageSize <= 0 ? 0 : (int) Math.ceil((double) totalRecords / pageSize);
    }

    private Long toLongOrNull(Object value) {
        if (value == null) {
            return null;
        }
        return toLong(value);
    }

    private long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof Date date) {
            return date.toLocalDate().atStartOfDay();
        }
        return value instanceof LocalDateTime localDateTime ? localDateTime : null;
    }

    private BigDecimal toHours(long minutes) {
        return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal toDays(long minutes) {
        return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(1440), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal toMoney(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal.setScale(2, RoundingMode.HALF_UP);
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue()).setScale(2, RoundingMode.HALF_UP);
        }
        return new BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP);
    }

    private GroupByDefinition groupByDefinition(String groupBy) {
        String normalized = groupBy == null ? "" : groupBy.trim().toLowerCase();
        return switch (normalized) {
            case "site" -> new GroupByDefinition("CAST(site_id AS VARCHAR)", "COALESCE(site_name, 'Unassigned Site')");
            case "category" -> new GroupByDefinition("COALESCE(category, 'Unassigned')", "COALESCE(category, 'Unassigned')");
            case "criticality" -> new GroupByDefinition("COALESCE(criticality, 'Unassigned')", "COALESCE(criticality, 'Unassigned')");
            default -> throw new ResourceNotFoundException("Unsupported equipment cost report group: " + groupBy);
        };
    }

    private record ReportFilter(String siteCondition, String equipmentCondition, Map<String, Object> params) {
    }

    private record GroupByDefinition(String keyExpression, String nameExpression) {
    }
}
