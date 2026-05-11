package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.OtherExpenseEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtherExpenseEntryRepository extends JpaRepository<OtherExpenseEntry, Long> {
}
