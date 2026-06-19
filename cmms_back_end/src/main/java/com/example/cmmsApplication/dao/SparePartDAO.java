package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.SparePart;
import com.example.cmmsApplication.repository.SparePartRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class SparePartDAO {
    private final SparePartRepository repository;

    public SparePartDAO(SparePartRepository repository) {
        this.repository = repository;
    }

    public SparePart save(SparePart sparePart) { return repository.save(sparePart); }
    public Optional<SparePart> findById(Long id) { return repository.findById(id); }
    public Optional<SparePart> findByPartCode(String partCode) { return repository.findByPartCode(partCode); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public boolean existsByPartCode(String partCode) { return repository.existsByPartCode(partCode); }
    public boolean existsByPartCodeAndIdNot(String partCode, Long id) { return repository.existsByPartCodeAndIdNot(partCode, id); }
}
