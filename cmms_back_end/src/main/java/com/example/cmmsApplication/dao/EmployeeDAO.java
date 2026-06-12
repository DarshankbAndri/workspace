package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.Employee;
import com.example.cmmsApplication.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class EmployeeDAO {
    private final EmployeeRepository repository;

    public EmployeeDAO(EmployeeRepository repository) {
        this.repository = repository;
    }

    public Employee save(Employee employee) { return repository.save(employee); }
    public Optional<Employee> findById(Long id) { return repository.findById(id); }
    public Optional<Employee> findWithSiteAssignmentsById(Long id) { return repository.findWithSiteAssignmentsById(id); }
    public List<Employee> findAll() { return repository.findAll(); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public boolean existsByEmployeeCode(String code) { return repository.existsByEmployeeCode(code); }
    public boolean existsByEmployeeCodeAndIdNot(String code, Long id) { return repository.existsByEmployeeCodeAndIdNot(code, id); }
}
