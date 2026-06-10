package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.BillsPaidByCompanyEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillsPaidByCompanyEntryRepository extends JpaRepository<BillsPaidByCompanyEntry, Long> {
    List<BillsPaidByCompanyEntry> findByClaimId(Long claimId);
}
