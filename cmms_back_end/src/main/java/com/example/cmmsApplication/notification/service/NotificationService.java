package com.example.cmmsApplication.notification.service;

import com.example.cmmsApplication.notification.dto.NotificationDTO;
import com.example.cmmsApplication.notification.dto.NotificationPageDTO;
import com.example.cmmsApplication.approval.entity.ApprovalRequest;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.time.LocalDate;
import java.util.List;

/** Service contract for notification. */
public interface NotificationService {
    List<NotificationDTO> getMine();

    NotificationPageDTO searchMine(String status, String type, String priority, String search, Integer page, Integer size);

    long getUnreadCount();

    SseEmitter subscribeMine();

    NotificationDTO markRead(Long id);

    void markAllRead();

    void archive(Long id);

    void createPmDueReminder(PreventiveMaintenanceSchedule schedule, LocalDate runDate);

    void createOverdueRequestAlert(MaintenanceRequest request, LocalDate runDate);

    void createApprovalPendingAlert(ApprovalRequest approvalRequest);

    void createLowStockAlert(SparePartSiteStock stock);

    void createAmcExpiryAlert(VendorAmcContract contract, String type, LocalDate runDate);
}
