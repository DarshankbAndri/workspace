package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.HotelEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelEntryRepository extends JpaRepository<HotelEntry, Long> {
}
