package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLogAttachment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceAssignmentWorkLogAttachmentRepository extends JpaRepository<MaintenanceAssignmentWorkLogAttachment, Long> {
    List<MaintenanceAssignmentWorkLogAttachment> findByWorkLogIdOrderByUploadedAtDesc(Long workLogId);
    void deleteByWorkLogId(Long workLogId);
}
