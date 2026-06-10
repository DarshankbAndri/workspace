package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.BillsPaidByCompanyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillsPaidByCompanyDocumentRepository extends JpaRepository<BillsPaidByCompanyDocument, Long> {
    List<BillsPaidByCompanyDocument> findBySectionId(String sectionId);
    List<BillsPaidByCompanyDocument> findByBillsPaidByCompanyEntry_Id(Long entryId);
    List<BillsPaidByCompanyDocument> findByBillsPaidByCompanyEntry_Claim_Id(Long claimId);
}
