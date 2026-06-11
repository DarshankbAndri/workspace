package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.EquipmentDAO;
import com.example.cmmsApplication.dao.EquipmentDowntimeDAO;
import com.example.cmmsApplication.dao.MaintenanceRequestDAO;
import com.example.cmmsApplication.dao.VendorDAO;
import com.example.cmmsApplication.dto.DashboardDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final EquipmentDAO equipmentDAO;
    private final VendorDAO vendorDAO;
    private final MaintenanceRequestDAO requestDAO;
    private final EquipmentDowntimeDAO downtimeDAO;

    public DashboardService(EquipmentDAO equipmentDAO, VendorDAO vendorDAO, MaintenanceRequestDAO requestDAO, EquipmentDowntimeDAO downtimeDAO) {
        this.equipmentDAO = equipmentDAO;
        this.vendorDAO = vendorDAO;
        this.requestDAO = requestDAO;
        this.downtimeDAO = downtimeDAO;
    }

    public DashboardDTO getSummary() {
        Long downtimeMinutes = downtimeDAO.sumDowntimeMinutes();
        BigDecimal downtimeHours = BigDecimal.valueOf(downtimeMinutes == null ? 0 : downtimeMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return new DashboardDTO(
                equipmentDAO.count(),
                vendorDAO.countActive(),
                requestDAO.countOpenRequests(),
                downtimeHours
        );
    }
}
