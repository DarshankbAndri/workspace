package com.example.cmmsApplication.assignment.dao;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MaintenanceAssignmentDAO {
    private final MaintenanceAssignmentRepository repository;

    public MaintenanceAssignment save(MaintenanceAssignment assignment) { return repository.save(assignment); }
    public Optional<MaintenanceAssignment> findById(Long id) { return repository.findById(id); }
    public List<MaintenanceAssignment> findAll() { return repository.findAll(); }
    public List<MaintenanceAssignment> findBySiteId(Long siteId) { return repository.findByRequestSiteId(siteId); }
    public List<MaintenanceAssignment> findBySiteIds(Collection<Long> siteIds) { return repository.findByRequestSiteIdIn(siteIds); }
    public void deleteById(Long id) { repository.deleteById(id); }
}




