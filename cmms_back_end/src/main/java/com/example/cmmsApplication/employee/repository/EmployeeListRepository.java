package com.example.cmmsApplication.employee.repository;


import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.employee.entity.EmployeeList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeListRepository extends JpaRepository<EmployeeList, Long>, JpaSpecificationExecutor<EmployeeList> {
}
