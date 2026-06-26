package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dto.DowntimeAnalysisPageDTO;
import com.example.cmmsApplication.dto.DowntimeAnalysisRowDTO;
import com.example.cmmsApplication.dto.DowntimeAnalysisSummaryDTO;
import com.example.cmmsApplication.dto.EquipmentHistoryRowDTO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import com.example.cmmsApplication.repository.EquipmentRepository;
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

@Service
@Transactional(readOnly = true)
public class ReportService {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    private final EntityManager entityManager;
    private final AccessControlService accessControlService;
    private final EquipmentRepository equipmentRepository;

    public ReportService(EntityManager entityManager,
                         AccessControlService accessControlService,
                         EquipmentRepository equipmentRepository) {
        this.entityManager = entityManager;
        this.accessControlService = accessControlService;
        this.equipmentRepository = equipmentRepository;
    }

    public PageProperties getEquipmentHistory(Long equipmentId, Long siteId, Integer page, Integer size) {
        accessControlService.validatePermission("REPORT_VIEW");
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
        accessControlService.validatePermission("REPORT_VIEW");
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

    private record ReportFilter(String siteCondition, String equipmentCondition, Map<String, Object> params) {
    }
}
