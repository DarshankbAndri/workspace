package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);

    Optional<User> findByEmployeeId(Long employeeId);

    List<User> findByActiveTrue();

    List<User> findByActiveTrueAndRole(UserRole role);
    
    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, Long id);
    
    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}
