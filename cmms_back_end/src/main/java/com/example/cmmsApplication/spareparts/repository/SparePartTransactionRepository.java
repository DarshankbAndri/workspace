package com.example.cmmsApplication.spareparts.repository;

import com.example.cmmsApplication.spareparts.entity.SparePartTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SparePartTransactionRepository extends JpaRepository<SparePartTransaction, Long> {
    List<SparePartTransaction> findByStockIdOrderByTransactionDateDesc(Long stockId);
}
