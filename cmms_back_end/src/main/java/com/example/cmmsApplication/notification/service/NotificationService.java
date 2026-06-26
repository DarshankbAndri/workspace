package com.example.cmmsApplication.notification.service;


import com.example.cmmsApplication.common.observability.ObservabilityMetrics;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.notification.dao.NotificationDAO;
import com.example.cmmsApplication.notification.dto.NotificationDTO;
import com.example.cmmsApplication.notification.dto.NotificationPageDTO;
import com.example.cmmsApplication.notification.dto.NotificationSettingDTO;
import com.example.cmmsApplication.approval.entity.ApprovalRequest;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.preventivemaintenance.entity.PreventiveMaintenanceSchedule;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.user.enums.UserRole;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.exception.UnauthorizedAccessException;
import com.example.cmmsApplication.user.repository.UserRepository;
import com.example.cmmsApplication.admin.repository.UserRoleAssignmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationDAO notificationDAO;
    private final AccessControlService accessControlService;
    private final UserRoleAssignmentRepository userRoleAssignmentRepository;
    private final UserRepository userRepository;
    private final NotificationSettingsService notificationSettingsService;
    private final EmailNotificationService emailNotificationService;
    private final NotificationStreamService notificationStreamService;
    private final ObservabilityMetrics observabilityMetrics;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getMine() {
        Long userId = accessControlService.getCurrentUserId();
        return notificationDAO.findActiveByRecipientUserId(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NotificationPageDTO searchMine(String status, String type, String priority, String search, Integer page, Integer size) {
        Long userId = accessControlService.getCurrentUserId();
        int pageNumber = Math.max(page == null ? 0 : page, 0);
        int pageSize = Math.min(Math.max(size == null ? 20 : size, 1), 100);
        Page<NotificationDTO> result = notificationDAO.searchMine(
                        userId,
                        emptyToNull(status),
                        emptyToNull(type),
                        emptyToNull(priority),
                        emptyToNull(search),
                        PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toDTO);
        return new NotificationPageDTO(result.getContent(), result.getTotalElements(), result.getTotalPages(), result.getNumber(), result.getSize());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationDAO.countUnreadByRecipientUserId(accessControlService.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public SseEmitter subscribeMine() {
        Long userId = accessControlService.getCurrentUserId();
        return notificationStreamService.subscribe(userId, notificationDAO.countUnreadByRecipientUserId(userId));
    }

    public NotificationDTO markRead(Long id) {
        Notification notification = getOwnedNotification(id);
        if (!"READ".equalsIgnoreCase(notification.getStatus())) {
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
        }
        Notification saved = notificationDAO.save(notification);
        NotificationDTO dto = toDTO(saved);
        Long userId = saved.getRecipientUser().getId();
        notificationStreamService.publishUpdated(userId, dto);
        notificationStreamService.publishUnreadCount(userId, notificationDAO.countUnreadByRecipientUserId(userId));
        return dto;
    }

    public void markAllRead() {
        Long userId = accessControlService.getCurrentUserId();
        notificationDAO.findActiveByRecipientUserId(userId).forEach((notification) -> {
            if ("UNREAD".equalsIgnoreCase(notification.getStatus())) {
                notification.setStatus("READ");
                notification.setReadAt(LocalDateTime.now());
                notificationDAO.save(notification);
            }
        });
        notificationStreamService.publishUnreadCount(userId, notificationDAO.countUnreadByRecipientUserId(userId));
    }

    public void archive(Long id) {
        Notification notification = getOwnedNotification(id);
        notification.setStatus("ARCHIVED");
        Notification saved = notificationDAO.save(notification);
        Long userId = saved.getRecipientUser().getId();
        notificationStreamService.publishUpdated(userId, toDTO(saved));
        notificationStreamService.publishUnreadCount(userId, notificationDAO.countUnreadByRecipientUserId(userId));
    }

    public void createPmDueReminder(PreventiveMaintenanceSchedule schedule, LocalDate runDate) {
        NotificationSettingDTO settings = notificationSettingsService.getRuntimeSettings();
        if (!isEnabled(settings) || !Boolean.TRUE.equals(settings.getPmDueReminderEnabled()) || schedule == null) {
            return;
        }
        String equipmentName = schedule.getEquipment() == null ? "equipment" : schedule.getEquipment().getEquipmentName();
        String title = "Preventive maintenance due";
        String message = equipmentName + " PM " + schedule.getScheduleCode() + " is due on " + schedule.getNextDueDate() + ".";
        notifyRoleRecipients(settings, settings.getPmRecipientRoleCodes(), schedule.getSite(), "PM_DUE_REMINDER", title, message,
                "PM_SCHEDULE", schedule.getId(), schedule.getScheduleCode(),
                "/maintenance/preventive/" + schedule.getId() + "/view", schedule.getPriority(), "PM_DUE:" + schedule.getId() + ":" + runDate);
        schedule.setLastNotificationStatus("IN_APP_QUEUED for " + schedule.getScheduleCode());
        schedule.setLastNotificationAt(LocalDateTime.now());
    }

    public void createOverdueRequestAlert(MaintenanceRequest request, LocalDate runDate) {
        NotificationSettingDTO settings = notificationSettingsService.getRuntimeSettings();
        if (!isEnabled(settings) || !Boolean.TRUE.equals(settings.getOverdueRequestEnabled()) || request == null) {
            return;
        }
        String title = "Maintenance request overdue";
        String message = request.getRequestNumber() + " is overdue. Target completion date was " + request.getTargetCompletionDate() + ".";
        notifyRoleRecipients(settings, settings.getOverdueRecipientRoleCodes(), request.getSite(), "OVERDUE_REQUEST", title, message,
                "MAINTENANCE_REQUEST", request.getId(), request.getRequestNumber(),
                "/maintenance/requests/" + request.getId() + "/view", request.getPriority(), "OVERDUE_REQUEST:" + request.getId() + ":" + runDate);
    }

    public void createApprovalPendingAlert(ApprovalRequest approvalRequest) {
        NotificationSettingDTO settings = notificationSettingsService.getRuntimeSettings();
        if (!isEnabled(settings) || !Boolean.TRUE.equals(settings.getApprovalPendingEnabled()) || approvalRequest == null) {
            return;
        }
        List<String> roleCodes = approvalRequest.getApproverRoleCode() == null || approvalRequest.getApproverRoleCode().isBlank()
                ? settings.getApprovalFallbackRoleCodes()
                : List.of(approvalRequest.getApproverRoleCode());
        String title = "Approval pending";
        String message = approvalRequest.getModuleCode() + " " + approvalRequest.getActionCode()
                + " is waiting for approval for " + (approvalRequest.getReferenceCode() == null ? approvalRequest.getReferenceId() : approvalRequest.getReferenceCode()) + ".";
        notifyRoleRecipients(settings, roleCodes, approvalRequest.getSite(), "APPROVAL_PENDING", title, message,
                approvalRequest.getModuleCode(), approvalRequest.getReferenceId(), approvalRequest.getReferenceCode(),
                "/approvals/pending", "HIGH", "APPROVAL_PENDING:" + approvalRequest.getId());
    }

    public void createLowStockAlert(SparePartSiteStock stock) {
        NotificationSettingDTO settings = notificationSettingsService.getRuntimeSettings();
        if (!isEnabled(settings) || stock == null || stock.getSparePart() == null || stock.getSite() == null) {
            return;
        }
        String partCode = stock.getSparePart().getPartCode();
        String title = "Spare part low stock";
        String message = partCode + " - " + stock.getSparePart().getPartName()
                + " is at " + stock.getCurrentStock() + " " + stock.getSparePart().getUnit()
                + " for " + stock.getSite().getSiteName()
                + ". Minimum stock is " + stock.getMinimumStock() + ".";
        notifyRoleRecipients(settings, List.of("ADMIN", "SUPER_ADMIN", "SITE_MANAGER", "MAINTENANCE_MANAGER"),
                stock.getSite(), "LOW_STOCK", title, message,
                "SPARE_PART", stock.getId(), partCode,
                "/inventory/spare-parts", "HIGH", "LOW_STOCK:" + stock.getId() + ":" + stock.getCurrentStock());
        observabilityMetrics.recordStockoutAlert("low_stock");
    }

    private void notifyRoleRecipients(NotificationSettingDTO settings, Collection<String> roleCodes, Site site, String type, String title, String message,
                                      String moduleCode, Long referenceId, String referenceCode, String targetUrl,
                                      String priority, String dedupeBase) {
        boolean inAppEnabled = Boolean.TRUE.equals(settings.getInAppEnabled());
        boolean emailEnabled = Boolean.TRUE.equals(settings.getEmailEnabled());
        if (!inAppEnabled && !emailEnabled) {
            return;
        }
        resolveRecipients(roleCodes, site == null ? null : site.getId()).forEach((user) -> createForUser(user, site, type, title, message,
                moduleCode, referenceId, referenceCode, targetUrl, priority, dedupeBase + ":USER:" + user.getId(), inAppEnabled, emailEnabled));
    }

    private List<User> resolveRecipients(Collection<String> roleCodes, Long siteId) {
        Map<Long, User> recipients = new LinkedHashMap<>();
        List<String> normalizedRoles = roleCodes == null ? List.of() : roleCodes.stream()
                .filter(Objects::nonNull)
                .map((role) -> role.trim().toUpperCase(Locale.ROOT))
                .filter((role) -> !role.isBlank())
                .collect(Collectors.toList());
        if (!normalizedRoles.isEmpty()) {
            userRoleAssignmentRepository.findActiveUsersByRoleCodesAndSiteId(normalizedRoles, siteId)
                    .forEach((user) -> recipients.put(user.getId(), user));
        }
        if (normalizedRoles.contains("ADMIN") || normalizedRoles.contains("SUPER_ADMIN")) {
            userRepository.findByActiveTrueAndRole(UserRole.ADMIN).forEach((user) -> recipients.put(user.getId(), user));
        }
        if (recipients.isEmpty()) {
            userRepository.findByActiveTrueAndRole(UserRole.ADMIN).forEach((user) -> recipients.put(user.getId(), user));
        }
        return List.copyOf(recipients.values());
    }

    private void createForUser(User user, Site site, String type, String title, String message, String moduleCode,
                               Long referenceId, String referenceCode, String targetUrl, String priority, String dedupeKey,
                               boolean inAppEnabled, boolean emailEnabled) {
        if (user == null || notificationDAO.existsByDedupeKey(dedupeKey)) {
            return;
        }
        Notification notification = new Notification();
        notification.setRecipientUser(user);
        notification.setSite(site);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setModuleCode(moduleCode);
        notification.setReferenceId(referenceId);
        notification.setReferenceCode(referenceCode);
        notification.setTargetUrl(targetUrl);
        notification.setPriority(priority == null || priority.isBlank() ? "MEDIUM" : priority);
        notification.setDedupeKey(dedupeKey);
        notification.setStatus(inAppEnabled ? "UNREAD" : "ARCHIVED");
        notification.setEmailStatus(emailEnabled ? "PENDING" : "NOT_REQUIRED");
        Notification saved = notificationDAO.save(notification);
        if (inAppEnabled) {
            notificationStreamService.publishCreated(user.getId(), toDTO(saved));
            notificationStreamService.publishUnreadCount(user.getId(), notificationDAO.countUnreadByRecipientUserId(user.getId()));
        }
        if (emailEnabled) {
            try {
                if (emailNotificationService.send(saved)) {
                    saved.setEmailStatus("SENT");
                    saved.setSentEmailAt(LocalDateTime.now());
                } else {
                    saved.setEmailStatus("FAILED");
                }
            } catch (RuntimeException ex) {
                saved.setEmailStatus("FAILED");
            }
            notificationDAO.save(saved);
        }
    }

    private Notification getOwnedNotification(Long id) {
        Notification notification = notificationDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (notification.getRecipientUser() == null || !notification.getRecipientUser().getId().equals(accessControlService.getCurrentUserId())) {
            throw new UnauthorizedAccessException("You do not have access to this notification");
        }
        return notification;
    }

    private boolean isEnabled(NotificationSettingDTO settings) {
        return Boolean.TRUE.equals(settings.getEnabled())
                && (Boolean.TRUE.equals(settings.getInAppEnabled()) || Boolean.TRUE.equals(settings.getEmailEnabled()));
    }

    private String emptyToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setRecipientUserId(notification.getRecipientUser() == null ? null : notification.getRecipientUser().getId());
        dto.setRecipientName(userName(notification.getRecipientUser()));
        dto.setSiteId(notification.getSite() == null ? null : notification.getSite().getId());
        dto.setSiteName(notification.getSite() == null ? null : notification.getSite().getSiteName());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setModuleCode(notification.getModuleCode());
        dto.setReferenceId(notification.getReferenceId());
        dto.setReferenceCode(notification.getReferenceCode());
        dto.setTargetUrl(notification.getTargetUrl());
        dto.setPriority(notification.getPriority());
        dto.setStatus(notification.getStatus());
        dto.setReadAt(notification.getReadAt());
        dto.setEmailStatus(notification.getEmailStatus());
        dto.setSentEmailAt(notification.getSentEmailAt());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }

    private String userName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
