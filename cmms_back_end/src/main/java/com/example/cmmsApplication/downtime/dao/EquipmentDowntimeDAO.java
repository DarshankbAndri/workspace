package com.example.cmmsApplication.downtime.dao;

import com.example.cmmsApplication.downtime.entity.EquipmentDowntime;
import com.example.cmmsApplication.downtime.repository.EquipmentDowntimeRepository;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class EquipmentDowntimeDAO {
    private final EquipmentDowntimeRepository repository;

    public EquipmentDowntimeDAO(EquipmentDowntimeRepository repository) {
        this.repository = repository;
    }

    public EquipmentDowntime save(EquipmentDowntime downtime) { return repository.save(downtime); }
    public Optional<EquipmentDowntime> findById(Long id) { return repository.findById(id); }
    public List<EquipmentDowntime> findAll() { return repository.findAll(); }
    public List<EquipmentDowntime> findByEquipmentId(Long equipmentId) { return repository.findByEquipmentId(equipmentId); }
    public List<EquipmentDowntime> findBySiteId(Long siteId) { return repository.findBySiteId(siteId); }
    public List<EquipmentDowntime> findBySiteIds(Collection<Long> siteIds) { return repository.findBySiteIdIn(siteIds); }
    public List<EquipmentDowntime> findBySiteIdAndEquipmentId(Long siteId, Long equipmentId) { return repository.findBySiteIdAndEquipmentId(siteId, equipmentId); }
    public List<EquipmentDowntime> findBySiteIdsAndEquipmentId(Collection<Long> siteIds, Long equipmentId) { return repository.findBySiteIdInAndEquipmentId(siteIds, equipmentId); }
    public long countOverlappingActiveDowntime(Long equipmentId, Long excludeId, LocalDateTime start, LocalDateTime end) {
        if (end == null) {
            return repository.countOverlappingActiveOpenEndedDowntime(equipmentId, excludeId, start);
        }
        return repository.countOverlappingActiveDowntime(equipmentId, excludeId, start, end);
    }
    public void deleteById(Long id) { repository.deleteById(id); }
    public Long sumDowntimeMinutes() { return repository.sumDowntimeMinutes(); }
    public Long sumDowntimeMinutesBySiteId(Long siteId) { return repository.sumDowntimeMinutesBySiteId(siteId); }
}
