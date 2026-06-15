package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.RolePermission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    @EntityGraph(attributePaths = {"role", "permission"})
    List<RolePermission> findByRoleRoleCodeIn(Collection<String> roleCodes);

    @EntityGraph(attributePaths = {"role", "permission"})
    List<RolePermission> findByRoleId(Long roleId);

    void deleteByRoleId(Long roleId);
}
