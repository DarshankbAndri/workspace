package com.example.cmmsApplication.dashboard.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.equipment.dao.EquipmentDAO;
import com.example.cmmsApplication.downtime.dao.EquipmentDowntimeDAO;
import com.example.cmmsApplication.maintenancerequest.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.spareparts.dao.SparePartSiteStockDAO;
import com.example.cmmsApplication.vendor.dao.VendorDAO;
import com.example.cmmsApplication.dashboard.dto.DashboardDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {
    private final EquipmentDAO equipmentDAO;
    private final VendorDAO vendorDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final EquipmentDowntimeDAO downtimeDAO;
    private final SparePartSiteStockDAO stockDAO;
    private final AccessControlService accessControlService;

    public DashboardDTO getSummary(Long siteId) {
        if (siteId != null) {
            accessControlService.validateSiteAccess(siteId);
        }
        if (siteId == null && !accessControlService.isAdmin()) {
            return getAllowedSitesSummary();
        }
        Long downtimeMinutes = siteId == null ? downtimeDAO.sumDowntimeMinutes() : downtimeDAO.sumDowntimeMinutesBySiteId(siteId);
        BigDecimal downtimeHours = BigDecimal.valueOf(downtimeMinutes == null ? 0 : downtimeMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return new DashboardDTO(
                siteId == null ? equipmentDAO.count() : equipmentDAO.countBySiteId(siteId),
                vendorDAO.countActive(),
                siteId == null ? requestDAO.countOpenRequests() : requestDAO.countOpenRequestsBySiteId(siteId),
                siteId == null ? stockDAO.countLowStock() : stockDAO.countLowStockBySiteId(siteId),
                downtimeHours
        );
    }

    private DashboardDTO getAllowedSitesSummary() {
        java.util.List<Long> siteIds = accessControlService.getAllowedSiteIds();
        long equipmentCount = siteIds.stream().mapToLong(equipmentDAO::countBySiteId).sum();
        long openRequests = siteIds.stream().mapToLong(requestDAO::countOpenRequestsBySiteId).sum();
        long downtimeMinutes = siteIds.stream()
                .map(downtimeDAO::sumDowntimeMinutesBySiteId)
                .filter(java.util.Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();
        BigDecimal downtimeHours = BigDecimal.valueOf(downtimeMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return new DashboardDTO(equipmentCount, vendorDAO.findBySiteIdsAndActive(siteIds, true).size(), openRequests, stockDAO.countLowStockBySiteIds(siteIds), downtimeHours);
    }
}
