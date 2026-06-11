package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.EquipmentDowntime;
import com.example.cmmsApplication.repository.EquipmentDowntimeRepository;
import org.springframework.stereotype.Component;
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
    public void deleteById(Long id) { repository.deleteById(id); }
    public Long sumDowntimeMinutes() { return repository.sumDowntimeMinutes(); }
}
