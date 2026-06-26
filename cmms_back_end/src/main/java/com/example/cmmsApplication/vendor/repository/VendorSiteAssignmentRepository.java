package com.example.cmmsApplication.vendor.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendor.entity.VendorSiteAssignment;
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





