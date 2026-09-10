package com.example.cmmsApplication.equipment.dao;
import com.example.cmmsApplication.equipment.entity.EquipmentChecklistItem;
import com.example.cmmsApplication.equipment.repository.EquipmentChecklistItemRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
@Component
@RequiredArgsConstructor
public class EquipmentChecklistItemDAO {
    private final EquipmentChecklistItemRepository repository;
    public List<EquipmentChecklistItem> findByOwnerId(Long id) { return repository.findByEquipmentIdOrderBySequenceNumberAscIdAsc(id); }
    public EquipmentChecklistItem save(EquipmentChecklistItem item) { return repository.save(item); }
    public java.util.Optional<EquipmentChecklistItem> findById(Long id) { return repository.findById(id); }
}
