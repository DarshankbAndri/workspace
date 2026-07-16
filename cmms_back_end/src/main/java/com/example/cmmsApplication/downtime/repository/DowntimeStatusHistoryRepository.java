package com.example.cmmsApplication.downtime.repository;

import com.example.cmmsApplication.downtime.entity.DowntimeStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DowntimeStatusHistoryRepository extends JpaRepository<DowntimeStatusHistory, Long> {
    List<DowntimeStatusHistory> findByDowntimeIdOrderByChangedAtDescIdDesc(Long downtimeId);
}
