package com.example.cmmsApplication.employee.dao;


import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.employee.entity.EmployeeSiteAssignment;
import com.example.cmmsApplication.employee.repository.EmployeeSiteAssignmentRepository;
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
