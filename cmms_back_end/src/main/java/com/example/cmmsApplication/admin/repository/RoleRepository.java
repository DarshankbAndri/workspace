package com.example.cmmsApplication.admin.repository;

import com.example.cmmsApplication.admin.entity.RoleMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleMaster, Long> {
    Optional<RoleMaster> findByRoleCode(String roleCode);
    boolean existsByRoleCode(String roleCode);
    boolean existsByRoleCodeAndIdNot(String roleCode, Long id);
}




