package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceAssignmentChecklistItemRepository extends JpaRepository<MaintenanceAssignmentChecklistItem, Long> {
    List<MaintenanceAssignmentChecklistItem> findByAssignmentIdOrderBySequenceNumberAscIdAsc(Long assignmentId);
    long countByAssignmentId(Long assignmentId);
}
