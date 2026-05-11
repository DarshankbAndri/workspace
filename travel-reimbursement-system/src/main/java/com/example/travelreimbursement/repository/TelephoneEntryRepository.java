package com.example.travelreimbursement.repository;

import com.example.travelreimbursement.entity.TelephoneEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelephoneEntryRepository extends JpaRepository<TelephoneEntry, Long> {
}
