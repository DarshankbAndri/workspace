package com.example.cmmsApplication.employee.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.employee.entity.Employee;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmployeeCode(String employeeCode);
    boolean existsByEmployeeCodeAndIdNot(String employeeCode, Long id);

    @EntityGraph(attributePaths = {"siteAssignments", "siteAssignments.site"})
    Optional<Employee> findWithSiteAssignmentsById(Long id);
}





