package com.example.cmmsApplication.company.repository;

import com.example.cmmsApplication.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByCompanyCode(String companyCode);
    boolean existsByCompanyCodeAndIdNot(String companyCode, Long id);
    Optional<Company> findFirstByStatusIgnoreCaseOrderByUpdatedDateDescIdDesc(String status);
    Optional<Company> findFirstByOrderByUpdatedDateDescIdDesc();
}




