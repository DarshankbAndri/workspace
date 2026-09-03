package com.example.cmmsApplication.approval.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            ar.approval_request_id AS id,
            ar.module_code AS module_code,
            ar.action_code AS action_code,
            ar.reference_id AS reference_id,
            ar.reference_code AS reference_code,
            ar.site_id AS site_id,
            s.site_code AS site_code,
            s.site_name AS site_name,
            ar.requested_by AS requested_by_id,
            TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS requested_by_name,
            ar.requested_at AS requested_at,
            ar.approval_status AS approval_status,
            COALESCE(NULLIF(TRIM(ar.approver_role_code), ''), '') AS approver_role_code,
            ar.min_approval_count AS min_approval_count,
            ar.approved_count AS approved_count,
            ar.rejected_count AS rejected_count,
            ar.remarks AS remarks,
            ar.payload_json AS payload_json,
            ar.created_at AS created_at,
            ar.updated_at AS updated_at
        FROM approval_request ar
        LEFT JOIN site_master s ON s.site_id = ar.site_id
        LEFT JOIN users u ON u.id = ar.requested_by
        """)
@Getter
@Setter
@NoArgsConstructor
public class ApprovalRequestList {
    @Id
    private Long id;
    @Column(name = "module_code")
    private String moduleCode;
    @Column(name = "action_code")
    private String actionCode;
    @Column(name = "reference_id")
    private Long referenceId;
    @Column(name = "reference_code")
    private String referenceCode;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "site_code")
    private String siteCode;
    @Column(name = "site_name")
    private String siteName;
    @Column(name = "requested_by_id")
    private Long requestedById;
    @Column(name = "requested_by_name")
    private String requestedByName;
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    @Column(name = "approval_status")
    private String approvalStatus;
    @Column(name = "approver_role_code")
    private String approverRoleCode;
    @Column(name = "min_approval_count")
    private Integer minApprovalCount;
    @Column(name = "approved_count")
    private Integer approvedCount;
    @Column(name = "rejected_count")
    private Integer rejectedCount;
    private String remarks;
    @Column(name = "payload_json")
    private String payloadJson;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
