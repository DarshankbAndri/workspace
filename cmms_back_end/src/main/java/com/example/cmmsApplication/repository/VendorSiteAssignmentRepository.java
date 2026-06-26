package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.VendorSiteAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorSiteAssignmentRepository extends JpaRepository<VendorSiteAssignment, Long> {
    @EntityGraph(attributePaths = {"site"})
    List<VendorSiteAssignment> findByVendorId(Long vendorId);
    boolean existsByVendorIdAndSiteIdAndStatusIgnoreCase(Long vendorId, Long siteId, String status);
}
