package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    boolean existsByVendorCode(String vendorCode);
    boolean existsByVendorCodeAndIdNot(String vendorCode, Long id);
    long countByActiveTrue();
}
