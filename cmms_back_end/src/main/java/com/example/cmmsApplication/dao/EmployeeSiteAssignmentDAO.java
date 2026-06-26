package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.EmployeeSiteAssignment;
import com.example.cmmsApplication.repository.EmployeeSiteAssignmentRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmployeeSiteAssignmentDAO {
    private final EmployeeSiteAssignmentRepository repository;

    public EmployeeSiteAssignmentDAO(EmployeeSiteAssignmentRepository repository) {
        this.repository = repository;
    }

    public List<EmployeeSiteAssignment> findByEmployeeId(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }
}
