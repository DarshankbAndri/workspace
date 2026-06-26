package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.RoleList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleListRepository extends JpaRepository<RoleList, Long>, JpaSpecificationExecutor<RoleList> {
}
