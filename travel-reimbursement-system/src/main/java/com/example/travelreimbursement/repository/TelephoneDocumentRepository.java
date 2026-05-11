package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.TelephoneDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelephoneDocumentRepository extends JpaRepository<TelephoneDocument, Long> {
    List<TelephoneDocument> findBySectionId(String sectionId);
    List<TelephoneDocument> findByTelephoneEntry_Id(Long entryId);
    List<TelephoneDocument> findByTelephoneEntry_Claim_Id(Long claimId);
}
