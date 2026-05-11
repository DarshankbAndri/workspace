package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.TaxiDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaxiDocumentRepository extends JpaRepository<TaxiDocument, Long> {
    List<TaxiDocument> findBySectionId(String sectionId);
    List<TaxiDocument> findByTaxiEntry_Id(Long entryId);
    List<TaxiDocument> findByTaxiEntry_Claim_Id(Long claimId);
}
