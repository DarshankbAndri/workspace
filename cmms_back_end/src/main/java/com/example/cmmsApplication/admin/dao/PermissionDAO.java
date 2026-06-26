package com.example.cmmsApplication.admin.dao;

import com.example.cmmsApplication.admin.entity.PermissionMaster;
import com.example.cmmsApplication.admin.repository.PermissionRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PermissionDAO {
    private final PermissionRepository repository;

    public PermissionDAO(PermissionRepository repository) {
        this.repository = repository;
    }

    public PermissionMaster save(PermissionMaster permission) { return repository.save(permission); }
    public Optional<PermissionMaster> findById(Long id) { return repository.findById(id); }
    public Optional<PermissionMaster> findByPermissionCode(String code) { return repository.findByPermissionCode(code); }
    public List<PermissionMaster> findAll() { return repository.findAll(); }
    public List<PermissionMaster> findActive() { return repository.findByStatusIgnoreCase("ACTIVE"); }
}
