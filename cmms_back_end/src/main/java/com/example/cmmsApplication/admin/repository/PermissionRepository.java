package com.example.cmmsApplication.admin.repository;

import com.example.cmmsApplication.admin.entity.PermissionMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionMaster, Long> {
    Optional<PermissionMaster> findByPermissionCode(String permissionCode);
    List<PermissionMaster> findByStatusIgnoreCase(String status);
    boolean existsByPermissionCode(String permissionCode);
}




