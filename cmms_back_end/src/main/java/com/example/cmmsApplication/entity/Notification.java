package com.example.cmmsApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipientUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    @Column(nullable = false, length = 60)
    private String type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "module_code", length = 100)
    private String moduleCode;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @Column(name = "target_url", length = 300)
    private String targetUrl;

    @Column(nullable = false, length = 30)
    private String priority = "MEDIUM";

    @Column(nullable = false, length = 30)
    private String status = "UNREAD";

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "email_status", nullable = false, length = 30)
    private String emailStatus = "NOT_REQUIRED";

    @Column(name = "sent_email_at")
    private LocalDateTime sentEmailAt;

    @Column(name = "dedupe_key", unique = true, length = 220)
    private String dedupeKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getRecipientUser() { return recipientUser; }
    public void setRecipientUser(User recipientUser) { this.recipientUser = recipientUser; }
    public Site getSite() { return site; }
    public void setSite(Site site) { this.site = site; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }
    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public String getEmailStatus() { return emailStatus; }
    public void setEmailStatus(String emailStatus) { this.emailStatus = emailStatus; }
    public LocalDateTime getSentEmailAt() { return sentEmailAt; }
    public void setSentEmailAt(LocalDateTime sentEmailAt) { this.sentEmailAt = sentEmailAt; }
    public String getDedupeKey() { return dedupeKey; }
    public void setDedupeKey(String dedupeKey) { this.dedupeKey = dedupeKey; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
