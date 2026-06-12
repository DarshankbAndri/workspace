package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.Equipment;
import com.example.cmmsApplication.repository.EquipmentRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class EquipmentDAO {
    private final EquipmentRepository repository;

    public EquipmentDAO(EquipmentRepository repository) {
        this.repository = repository;
    }

    public Equipment save(Equipment equipment) { return repository.save(equipment); }
    public Optional<Equipment> findById(Long id) { return repository.findById(id); }
    public List<Equipment> findAll() { return repository.findAll(); }
    public List<Equipment> findBySiteId(Long siteId) { return repository.findBySiteId(siteId); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public long count() { return repository.count(); }
    public long countBySiteId(Long siteId) { return repository.countBySiteId(siteId); }
    public boolean existsByEquipmentCode(String code) { return repository.existsByEquipmentCode(code); }
    public boolean existsByEquipmentCodeAndIdNot(String code, Long id) { return repository.existsByEquipmentCodeAndIdNot(code, id); }
}
