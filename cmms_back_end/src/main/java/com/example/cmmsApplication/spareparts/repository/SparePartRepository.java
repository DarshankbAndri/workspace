package com.example.cmmsApplication.spareparts.repository;

import com.example.cmmsApplication.spareparts.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    Optional<SparePart> findByPartCode(String partCode);
    boolean existsByPartCode(String partCode);
    boolean existsByPartCodeAndIdNot(String partCode, Long id);
}




