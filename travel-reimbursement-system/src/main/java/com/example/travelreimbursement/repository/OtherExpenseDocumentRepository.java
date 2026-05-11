package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.OtherExpenseDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OtherExpenseDocumentRepository extends JpaRepository<OtherExpenseDocument, Long> {
    List<OtherExpenseDocument> findBySectionId(String sectionId);
    List<OtherExpenseDocument> findByOtherExpenseEntry_Id(Long entryId);
    List<OtherExpenseDocument> findByOtherExpenseEntry_Claim_Id(Long claimId);
}
