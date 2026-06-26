package com.example.cmmsApplication.vendor.dao;


import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendor.entity.VendorSiteAssignment;
import com.example.cmmsApplication.vendor.repository.VendorSiteAssignmentRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VendorSiteAssignmentDAO {
    private final VendorSiteAssignmentRepository repository;

    public VendorSiteAssignmentDAO(VendorSiteAssignmentRepository repository) {
        this.repository = repository;
    }

    public List<VendorSiteAssignment> findByVendorId(Long vendorId) {
        return repository.findByVendorId(vendorId);
    }

    public boolean existsActiveAssignment(Long vendorId, Long siteId) {
        return repository.existsByVendorIdAndSiteIdAndStatusIgnoreCase(vendorId, siteId, "ACTIVE");
    }
}
