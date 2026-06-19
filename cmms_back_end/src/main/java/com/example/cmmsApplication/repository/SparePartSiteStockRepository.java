package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.SparePartSiteStock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SparePartSiteStockRepository extends JpaRepository<SparePartSiteStock, Long> {
    Optional<SparePartSiteStock> findBySparePartIdAndSiteId(Long sparePartId, Long siteId);
    boolean existsBySparePartIdAndSiteId(Long sparePartId, Long siteId);
    List<SparePartSiteStock> findBySiteIdAndStatus(Long siteId, String status);
    List<SparePartSiteStock> findBySiteIdInAndStatus(Collection<Long> siteIds, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select stock from SparePartSiteStock stock where stock.id = :id")
    Optional<SparePartSiteStock> findByIdForUpdate(Long id);
}
