package com.example.cmmsApplication.equipment.dao;
import com.example.cmmsApplication.equipment.entity.EquipmentChecklist;
import com.example.cmmsApplication.equipment.repository.EquipmentChecklistRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class EquipmentChecklistDAO {
    private final EquipmentChecklistRepository repository;
    public List<EquipmentChecklist> findByEquipmentId(Long id) { return repository.findByEquipmentIdOrderByIdAsc(id); }
    public EquipmentChecklist save(EquipmentChecklist item) { return repository.save(item); }
}
