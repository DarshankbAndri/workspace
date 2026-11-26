package com.example.cmmsApplication.approval.repository;

import com.example.cmmsApplication.approval.entity.ApprovalRequestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalRequestListRepository extends
        JpaRepository<ApprovalRequestList, Long>,
        JpaSpecificationExecutor<ApprovalRequestList> {
}
