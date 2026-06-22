package com.example.cmmsApplication.spareparts.dao;

import com.example.cmmsApplication.spareparts.entity.SparePartTransaction;
import com.example.cmmsApplication.spareparts.repository.SparePartTransactionRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SparePartTransactionDAO {
    private final SparePartTransactionRepository repository;

    public SparePartTransactionDAO(SparePartTransactionRepository repository) {
        this.repository = repository;
    }

    public SparePartTransaction save(SparePartTransaction transaction) { return repository.save(transaction); }
    public List<SparePartTransaction> findByStockId(Long stockId) { return repository.findByStockIdOrderByTransactionDateDesc(stockId); }
}




