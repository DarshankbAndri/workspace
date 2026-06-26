package com.example.cmmsApplication.spareparts.repository;

import com.example.cmmsApplication.spareparts.entity.SparePartStockList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SparePartStockListRepository extends JpaRepository<SparePartStockList, Long>, JpaSpecificationExecutor<SparePartStockList> {
}




