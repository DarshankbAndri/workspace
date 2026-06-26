package com.example.cmmsApplication.admin.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.admin.entity.UserRoleAssignment;
import com.example.cmmsApplication.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, Long> {
    @EntityGraph(attributePaths = {"role", "site", "user"})
    List<UserRoleAssignment> findByUserIdAndStatusIgnoreCase(Long userId, String status);

    @EntityGraph(attributePaths = {"role", "site", "user"})
    List<UserRoleAssignment> findByUserId(Long userId);

    @Query("select distinct assignment.user from UserRoleAssignment assignment " +
            "where upper(assignment.status) = 'ACTIVE' " +
            "and assignment.user.active = true " +
            "and assignment.role.roleCode in :roleCodes " +
            "and (:siteId is null or assignment.site is null or assignment.site.id = :siteId)")
    List<User> findActiveUsersByRoleCodesAndSiteId(@Param("roleCodes") Collection<String> roleCodes, @Param("siteId") Long siteId);

    boolean existsByUserIdAndRoleIdAndStatusIgnoreCase(Long userId, Long roleId, String status);

    void deleteByUserId(Long userId);
}
