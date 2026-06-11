package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.EquipmentDowntime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentDowntimeRepository extends JpaRepository<EquipmentDowntime, Long> {
    List<EquipmentDowntime> findByEquipmentId(Long equipmentId);

    @Query("select coalesce(sum(d.downtimeMinutes), 0) from EquipmentDowntime d")
    Long sumDowntimeMinutes();
}
