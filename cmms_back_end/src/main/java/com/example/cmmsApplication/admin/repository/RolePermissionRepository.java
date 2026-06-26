package com.example.cmmsApplication.admin.repository;

import com.example.cmmsApplication.admin.entity.RolePermission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    @EntityGraph(attributePaths = {"role", "permission"})
    List<RolePermission> findByRoleRoleCodeIn(Collection<String> roleCodes);

    @EntityGraph(attributePaths = {"role", "permission"})
    List<RolePermission> findByRoleId(Long roleId);

    @Modifying
    @Query("delete from RolePermission rolePermission where rolePermission.role.id = :roleId")
    void deleteByRoleId(@Param("roleId") Long roleId);
}
