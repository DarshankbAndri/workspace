package com.example.cmmsApplication.spareparts.repository;

import com.example.cmmsApplication.spareparts.entity.SparePartReorderRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SparePartReorderRepository extends JpaRepository<SparePartReorderRequest, Long> {
    List<SparePartReorderRequest> findAllByOrderByRequestedAtDesc();
    List<SparePartReorderRequest> findBySiteIdInOrderByRequestedAtDesc(Collection<Long> siteIds);
    List<SparePartReorderRequest> findBySiteIdAndStatusOrderByRequestedAtDesc(Long siteId, String status);
    List<SparePartReorderRequest> findBySiteIdInAndStatusOrderByRequestedAtDesc(Collection<Long> siteIds, String status);
}
