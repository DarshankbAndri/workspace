package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.DailySummaryDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailySummaryDocumentRepository extends JpaRepository<DailySummaryDocument, Long> {
    List<DailySummaryDocument> findBySectionId(String sectionId);
    List<DailySummaryDocument> findByDailySummaryEntry_Id(Long entryId);
    List<DailySummaryDocument> findByDailySummaryEntry_Claim_Id(Long claimId);
}
