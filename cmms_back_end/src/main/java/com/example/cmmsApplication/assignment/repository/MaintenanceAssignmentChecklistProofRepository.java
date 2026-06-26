package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistProof;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceAssignmentChecklistProofRepository extends JpaRepository<MaintenanceAssignmentChecklistProof, Long> {
    List<MaintenanceAssignmentChecklistProof> findByChecklistItemIdOrderByUploadedAtDesc(Long checklistItemId);
    long countByChecklistItemId(Long checklistItemId);
    void deleteByChecklistItemId(Long checklistItemId);
}
