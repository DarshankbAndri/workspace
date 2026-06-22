package com.example.cmmsApplication.admin.dao;

import com.example.cmmsApplication.admin.entity.RoleMaster;
import com.example.cmmsApplication.admin.repository.RoleRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class RoleDAO {
    private final RoleRepository repository;

    public RoleDAO(RoleRepository repository) {
        this.repository = repository;
    }

    public RoleMaster save(RoleMaster role) { return repository.save(role); }
    public Optional<RoleMaster> findById(Long id) { return repository.findById(id); }
    public Optional<RoleMaster> findByRoleCode(String roleCode) { return repository.findByRoleCode(roleCode); }
    public List<RoleMaster> findAll() { return repository.findAll(); }
    public boolean existsByRoleCode(String roleCode) { return repository.existsByRoleCode(roleCode); }
    public boolean existsByRoleCodeAndIdNot(String roleCode, Long id) { return repository.existsByRoleCodeAndIdNot(roleCode, id); }
}




