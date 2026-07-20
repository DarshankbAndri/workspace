package com.example.cmmsApplication.spareparts.dao;

import com.example.cmmsApplication.spareparts.entity.MaintenanceSpareUsage;
import com.example.cmmsApplication.spareparts.repository.MaintenanceSpareUsageRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class MaintenanceSpareUsageDAO {
    private final MaintenanceSpareUsageRepository repository;

    public MaintenanceSpareUsageDAO(MaintenanceSpareUsageRepository repository) {
        this.repository = repository;
    }

    public MaintenanceSpareUsage save(MaintenanceSpareUsage usage) { return repository.save(usage); }
    public Optional<MaintenanceSpareUsage> findById(Long id) { return repository.findById(id); }
    public List<MaintenanceSpareUsage> findAll() { return repository.findAllByOrderByCreatedAtDesc(); }
    public List<MaintenanceSpareUsage> findByStatus(String status) { return repository.findByStatusOrderByCreatedAtDesc(status); }
    public Optional<MaintenanceSpareUsage> findByIdAndAssignmentId(Long id, Long assignmentId) { return repository.findByIdAndAssignmentId(id, assignmentId); }
    public List<MaintenanceSpareUsage> findByAssignmentId(Long assignmentId) { return repository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId); }
    public List<MaintenanceSpareUsage> findByRequestId(Long requestId) { return repository.findByAssignmentRequestIdOrderByCreatedAtDesc(requestId); }
    public boolean existsByAssignmentIdAndStockId(Long assignmentId, Long stockId) { return repository.existsByAssignmentIdAndStockId(assignmentId, stockId); }
    public void delete(MaintenanceSpareUsage usage) { repository.delete(usage); }
}
