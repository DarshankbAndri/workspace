package com.example.cmmsApplication.downtime.repository;

import com.example.cmmsApplication.downtime.entity.DowntimeRcaAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DowntimeRcaActionRepository extends JpaRepository<DowntimeRcaAction, Long> {
    List<DowntimeRcaAction> findByDowntimeIdOrderByCreatedAtDescIdDesc(Long downtimeId);
    Optional<DowntimeRcaAction> findByIdAndDowntimeId(Long id, Long downtimeId);
    long countByDowntimeId(Long downtimeId);
    long countByDowntimeIdAndStatusNot(Long downtimeId, String status);
}
