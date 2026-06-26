package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.EmployeeList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeListRepository extends JpaRepository<EmployeeList, Long>, JpaSpecificationExecutor<EmployeeList> {
}
