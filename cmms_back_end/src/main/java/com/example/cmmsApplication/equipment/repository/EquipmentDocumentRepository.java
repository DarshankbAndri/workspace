package com.example.cmmsApplication.equipment.repository;

import com.example.cmmsApplication.equipment.entity.EquipmentDocument;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentDocumentRepository extends JpaRepository<EquipmentDocument, Long> {
    List<EquipmentDocument> findByEquipment_IdOrderByUploadedAtDescDocumentIdDesc(Long equipmentId);

    Optional<EquipmentDocument> findByDocumentIdAndEquipment_Id(Long documentId, Long equipmentId);
}
