package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.Notification;
import com.example.cmmsApplication.repository.NotificationRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class NotificationDAO {
    private final NotificationRepository repository;

    public NotificationDAO(NotificationRepository repository) {
        this.repository = repository;
    }

    public Notification save(Notification notification) { return repository.save(notification); }
    public Optional<Notification> findById(Long id) { return repository.findById(id); }
    public List<Notification> findActiveByRecipientUserId(Long userId) { return repository.findByRecipientUserIdAndStatusNotOrderByCreatedAtDesc(userId, "ARCHIVED"); }
    public long countUnreadByRecipientUserId(Long userId) { return repository.countByRecipientUserIdAndStatus(userId, "UNREAD"); }
    public boolean existsByDedupeKey(String dedupeKey) { return dedupeKey != null && repository.existsByDedupeKey(dedupeKey); }
}
