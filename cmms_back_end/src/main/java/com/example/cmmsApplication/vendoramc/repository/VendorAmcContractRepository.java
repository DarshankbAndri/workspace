package com.example.cmmsApplication.vendoramc.repository;

import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface VendorAmcContractRepository extends JpaRepository<VendorAmcContract, Long> {
    boolean existsByContractNumber(String contractNumber);
    boolean existsByContractNumberAndIdNot(String contractNumber, Long id);
    List<VendorAmcContract> findByVendorIdOrderByEndDateDesc(Long vendorId);
    long countByStatus(String status);

    @Query("""
            select contract
            from VendorAmcContract contract
            where contract.endDate between :today and :warningDate
              and upper(contract.status) in ('ACTIVE', 'EXPIRING_SOON')
            """)
    List<VendorAmcContract> findExpiring(LocalDate today, LocalDate warningDate);

    @Query("""
            select contract
            from VendorAmcContract contract
            where contract.endDate < :today
              and upper(contract.status) in ('ACTIVE', 'EXPIRING_SOON')
            """)
    List<VendorAmcContract> findExpired(LocalDate today);

    @Query("""
            select count(distinct mapping.equipment.id)
            from EquipmentAmcMapping mapping
            where mapping.active = true
              and upper(mapping.amcContract.status) in :statuses
              and current_date between mapping.coverageStartDate and mapping.coverageEndDate
            """)
    long countCoveredEquipment(Collection<String> statuses);
}
