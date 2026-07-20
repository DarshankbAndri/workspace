package com.example.cmmsApplication.spareparts.dao;

import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import com.example.cmmsApplication.spareparts.repository.SparePartSiteStockRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public class SparePartSiteStockDAO {
    private final SparePartSiteStockRepository repository;

    public SparePartSiteStockDAO(SparePartSiteStockRepository repository) {
        this.repository = repository;
    }

    public SparePartSiteStock save(SparePartSiteStock stock) { return repository.save(stock); }
    public List<SparePartSiteStock> findAll() { return repository.findAll(); }
    public Optional<SparePartSiteStock> findById(Long id) { return repository.findById(id); }
    public Optional<SparePartSiteStock> findByIdForUpdate(Long id) { return repository.findByIdForUpdate(id); }
    public Optional<SparePartSiteStock> findBySparePartIdAndSiteId(Long sparePartId, Long siteId) { return repository.findBySparePartIdAndSiteId(sparePartId, siteId); }
    public boolean existsBySparePartIdAndSiteId(Long sparePartId, Long siteId) { return repository.existsBySparePartIdAndSiteId(sparePartId, siteId); }
    public List<SparePartSiteStock> findBySiteIdAndStatus(Long siteId, String status) { return repository.findBySiteIdAndStatus(siteId, status); }
    public List<SparePartSiteStock> findBySiteIdInAndStatus(Collection<Long> siteIds, String status) { return repository.findBySiteIdInAndStatus(siteIds, status); }
    public long countLowStock() { return repository.countLowStock(); }
    public long countLowStockBySiteId(Long siteId) { return repository.countLowStockBySiteId(siteId); }
    public long countLowStockBySiteIds(Collection<Long> siteIds) { return repository.countLowStockBySiteIdIn(siteIds); }
}
