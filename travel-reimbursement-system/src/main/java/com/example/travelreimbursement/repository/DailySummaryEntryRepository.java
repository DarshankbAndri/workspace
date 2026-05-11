package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.DailySummaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailySummaryEntryRepository extends JpaRepository<DailySummaryEntry, Long> {
}
