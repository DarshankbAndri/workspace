package com.example.cmmsApplication.vendor.repository;


import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendor.entity.VendorList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorListRepository extends JpaRepository<VendorList, Long>, JpaSpecificationExecutor<VendorList> {
}
