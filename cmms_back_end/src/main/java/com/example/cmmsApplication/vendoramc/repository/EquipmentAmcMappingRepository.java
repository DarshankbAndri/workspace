package com.example.cmmsApplication.vendoramc.repository;

import com.example.cmmsApplication.vendoramc.entity.EquipmentAmcMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentAmcMappingRepository extends JpaRepository<EquipmentAmcMapping, Long> {
    boolean existsByAmcContractIdAndEquipmentId(Long amcContractId, Long equipmentId);
    Optional<EquipmentAmcMapping> findByAmcContractIdAndEquipmentId(Long amcContractId, Long equipmentId);
    List<EquipmentAmcMapping> findByAmcContractIdOrderByEquipmentEquipmentNameAsc(Long amcContractId);
    List<EquipmentAmcMapping> findByEquipmentIdOrderByCoverageEndDateDescIdDesc(Long equipmentId);
    long countByAmcContractId(Long amcContractId);

    @Modifying
    void deleteByAmcContractId(Long amcContractId);

    @Query("""
            select mapping
            from EquipmentAmcMapping mapping
            where mapping.equipment.id = :equipmentId
              and mapping.active = true
              and upper(mapping.amcContract.status) in :statuses
              and :date between mapping.coverageStartDate and mapping.coverageEndDate
            order by mapping.coverageEndDate desc, mapping.id desc
            """)
    List<EquipmentAmcMapping> findActiveByEquipment(Long equipmentId, LocalDate date, Collection<String> statuses);

    @Query("""
            select count(mapping)
            from EquipmentAmcMapping mapping
            where mapping.equipment.id = :equipmentId
              and mapping.active = true
              and mapping.amcContract.id <> :contractId
              and upper(mapping.amcContract.status) in :statuses
              and mapping.coverageStartDate <= :endDate
              and mapping.coverageEndDate >= :startDate
            """)
    long countOverlappingActive(Long equipmentId, Long contractId, LocalDate startDate, LocalDate endDate, Collection<String> statuses);
}
