package com.example.cmmsApplication.preventivemaintenance.dao;

import com.example.cmmsApplication.preventivemaintenance.entity.PmScheduleChecklistItem;
import com.example.cmmsApplication.preventivemaintenance.repository.PmScheduleChecklistItemRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PmScheduleChecklistItemDAO {
    private final PmScheduleChecklistItemRepository repository;

    public List<PmScheduleChecklistItem> findByScheduleId(Long scheduleId) {
        return repository.findByScheduleIdOrderBySequenceNumberAscIdAsc(scheduleId);
    }

    public List<PmScheduleChecklistItem> findActiveByScheduleId(Long scheduleId) {
        return repository.findByScheduleIdAndActiveTrueOrderBySequenceNumberAscIdAsc(scheduleId);
    }

    public PmScheduleChecklistItem save(PmScheduleChecklistItem item) {
        return repository.save(item);
    }

    public void deleteByScheduleId(Long scheduleId) {
        repository.deleteByScheduleId(scheduleId);
    }
}
