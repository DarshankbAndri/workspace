package com.example.cmmsApplication.preventivemaintenance.repository;

import com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PmScheduleChecklistItemRepository extends JpaRepository<PmScheduleChecklistItem, Long> {
    List<PmScheduleChecklistItem> findByScheduleIdOrderBySequenceNumberAscIdAsc(Long scheduleId);
    List<PmScheduleChecklistItem> findByScheduleIdAndActiveTrueOrderBySequenceNumberAscIdAsc(Long scheduleId);
    void deleteByScheduleId(Long scheduleId);
}
