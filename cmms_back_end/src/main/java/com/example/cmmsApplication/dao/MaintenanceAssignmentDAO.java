package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.MaintenanceAssignment;
import com.example.cmmsApplication.repository.MaintenanceAssignmentRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class MaintenanceAssignmentDAO {
    private final MaintenanceAssignmentRepository repository;

    public MaintenanceAssignmentDAO(MaintenanceAssignmentRepository repository) {
        this.repository = repository;
    }

    public MaintenanceAssignment save(MaintenanceAssignment assignment) { return repository.save(assignment); }
    public Optional<MaintenanceAssignment> findById(Long id) { return repository.findById(id); }
    public List<MaintenanceAssignment> findAll() { return repository.findAll(); }
    public void deleteById(Long id) { repository.deleteById(id); }
}
