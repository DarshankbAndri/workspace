package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.HotelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelDocumentRepository extends JpaRepository<HotelDocument, Long> {
    List<HotelDocument> findBySectionId(String sectionId);
    List<HotelDocument> findByHotelEntry_Id(Long entryId);
    List<HotelDocument> findByHotelEntry_Claim_Id(Long claimId);
}
