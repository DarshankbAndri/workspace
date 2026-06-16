package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.VendorList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorListRepository extends JpaRepository<VendorList, Long>, JpaSpecificationExecutor<VendorList> {
}
