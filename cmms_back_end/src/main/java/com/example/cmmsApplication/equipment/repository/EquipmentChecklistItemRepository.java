package com.example.cmmsApplication.equipment.repository;
import com.example.cmmsApplication.equipment.entity.EquipmentChecklistItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EquipmentChecklistItemRepository extends JpaRepository<EquipmentChecklistItem, Long> {
    List<EquipmentChecklistItem> findByEquipmentIdOrderBySequenceNumberAscIdAsc(Long id);
}
