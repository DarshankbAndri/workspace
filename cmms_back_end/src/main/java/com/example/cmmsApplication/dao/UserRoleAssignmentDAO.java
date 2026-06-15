package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.UserRoleAssignment;
import com.example.cmmsApplication.repository.UserRoleAssignmentRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserRoleAssignmentDAO {
    private final UserRoleAssignmentRepository repository;

    public UserRoleAssignmentDAO(UserRoleAssignmentRepository repository) {
        this.repository = repository;
    }

    public UserRoleAssignment save(UserRoleAssignment assignment) { return repository.save(assignment); }
    public List<UserRoleAssignment> findActiveByUserId(Long userId) { return repository.findByUserIdAndStatusIgnoreCase(userId, "ACTIVE"); }
    public void deleteByUserId(Long userId) { repository.deleteByUserId(userId); }
}
