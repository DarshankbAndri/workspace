package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdAndStatusNotOrderByCreatedAtDesc(Long recipientUserId, String status);
    long countByRecipientUserIdAndStatus(Long recipientUserId, String status);
    boolean existsByDedupeKey(String dedupeKey);
}
