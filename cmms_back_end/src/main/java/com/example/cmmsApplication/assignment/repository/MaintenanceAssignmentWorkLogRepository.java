package com.example.cmmsApplication.assignment.repository;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentWorkLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceAssignmentWorkLogRepository extends JpaRepository<MaintenanceAssignmentWorkLog, Long> {
    List<MaintenanceAssignmentWorkLog> findByAssignmentIdOrderByStartTimeDescIdDesc(Long assignmentId);
    long countByAssignmentId(Long assignmentId);
    long countByAssignmentIdAndCompletionStatus(Long assignmentId, String completionStatus);
    long countByAssignmentIdAndCompletionStatusIn(Long assignmentId, List<String> completionStatuses);
}
