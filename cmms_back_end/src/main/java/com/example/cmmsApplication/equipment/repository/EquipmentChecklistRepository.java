package com.example.cmmsApplication.equipment.repository;
import com.example.cmmsApplication.equipment.entity.EquipmentChecklist;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EquipmentChecklistRepository extends JpaRepository<EquipmentChecklist, Long> {
    List<EquipmentChecklist> findByEquipmentIdOrderByIdAsc(Long id);
}
