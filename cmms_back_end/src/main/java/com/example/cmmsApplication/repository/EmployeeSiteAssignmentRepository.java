package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.EmployeeSiteAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSiteAssignmentRepository extends JpaRepository<EmployeeSiteAssignment, Long> {
    @EntityGraph(attributePaths = {"site"})
    List<EmployeeSiteAssignment> findByEmployeeId(Long employeeId);
}
