package com.example.cmmsApplication.notification.dao;

import com.example.cmmsApplication.notification.entity.Notification;
import com.example.cmmsApplication.notification.repository.NotificationRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

    public Page<Notification> searchMine(Long userId, String status, String type, String priority, String search, Pageable pageable) {
        return repository.findAll((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("recipientUser").get("id"), userId));

            if (hasText(status)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("status")), normalize(status)));
            } else {
                predicates.add(criteriaBuilder.notEqual(criteriaBuilder.upper(root.get("status")), "ARCHIVED"));
            }
            if (hasText(type)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("type")), normalize(type)));
            }
            if (hasText(priority)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("priority")), normalize(priority)));
            }
            if (hasText(search)) {
                String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("message")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("referenceCode")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("moduleCode")), like)
                ));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String normalize(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }
}




