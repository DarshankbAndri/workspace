package com.example.cmmsApplication.employee.repository;


import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.employee.entity.EmployeeSiteAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSiteAssignmentRepository extends JpaRepository<EmployeeSiteAssignment, Long> {
    @EntityGraph(attributePaths = {"site"})
    List<EmployeeSiteAssignment> findByEmployeeId(Long employeeId);
}
