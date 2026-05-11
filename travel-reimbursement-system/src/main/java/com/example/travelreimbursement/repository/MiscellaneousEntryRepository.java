package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.MiscellaneousEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MiscellaneousEntryRepository extends JpaRepository<MiscellaneousEntry, Long> {
}
