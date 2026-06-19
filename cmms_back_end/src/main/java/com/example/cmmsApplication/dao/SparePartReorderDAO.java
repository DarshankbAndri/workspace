package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.SparePartReorderRequest;
import com.example.cmmsApplication.repository.SparePartReorderRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public class SparePartReorderDAO {
    private final SparePartReorderRepository repository;

    public SparePartReorderDAO(SparePartReorderRepository repository) {
        this.repository = repository;
    }

    public SparePartReorderRequest save(SparePartReorderRequest request) { return repository.save(request); }
    public Optional<SparePartReorderRequest> findById(Long id) { return repository.findById(id); }
    public List<SparePartReorderRequest> findAll() { return repository.findAllByOrderByRequestedAtDesc(); }
    public List<SparePartReorderRequest> findBySiteIds(Collection<Long> siteIds) { return repository.findBySiteIdInOrderByRequestedAtDesc(siteIds); }
    public List<SparePartReorderRequest> findBySiteIdAndStatus(Long siteId, String status) { return repository.findBySiteIdAndStatusOrderByRequestedAtDesc(siteId, status); }
    public List<SparePartReorderRequest> findBySiteIdsAndStatus(Collection<Long> siteIds, String status) { return repository.findBySiteIdInAndStatusOrderByRequestedAtDesc(siteIds, status); }
}
