package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    boolean existsByPartCode(String partCode);
    boolean existsByPartCodeAndIdNot(String partCode, Long id);
}
