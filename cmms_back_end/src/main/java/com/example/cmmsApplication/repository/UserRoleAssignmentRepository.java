package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.UserRoleAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, Long> {
    @EntityGraph(attributePaths = {"role", "site", "user"})
    List<UserRoleAssignment> findByUserIdAndStatusIgnoreCase(Long userId, String status);

    @EntityGraph(attributePaths = {"role", "site", "user"})
    List<UserRoleAssignment> findByUserId(Long userId);

    boolean existsByUserIdAndRoleIdAndStatusIgnoreCase(Long userId, Long roleId, String status);

    void deleteByUserId(Long userId);
}
