package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.MiscellaneousDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MiscellaneousDocumentRepository extends JpaRepository<MiscellaneousDocument, Long> {
    List<MiscellaneousDocument> findBySectionId(String sectionId);
    List<MiscellaneousDocument> findByMiscellaneousEntry_Id(Long entryId);
    List<MiscellaneousDocument> findByMiscellaneousEntry_Claim_Id(Long claimId);
}
