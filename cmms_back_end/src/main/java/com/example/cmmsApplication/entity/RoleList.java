package com.example.cmmsApplication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            r.role_id AS id,
            r.role_code AS role_code,
            r.role_name AS role_name,
            r.description AS description,
            r.status AS status,
            COALESCE(permission_counts.permission_count, 0) AS permission_count,
            r.created_at AS created_at,
            r.updated_at AS updated_at
        FROM role_master r
        LEFT JOIN (
            SELECT role_id, COUNT(*) AS permission_count
            FROM role_permission
            GROUP BY role_id
        ) permission_counts ON permission_counts.role_id = r.role_id
        """)
public class RoleList {
    @Id
    private Long id;
    @Column(name = "role_code")
    private String roleCode;
    @Column(name = "role_name")
    private String roleName;
    private String description;
    private String status;
    @Column(name = "permission_count")
    private Integer permissionCount;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getRoleCode() { return roleCode; }
    public String getRoleName() { return roleName; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public Integer getPermissionCount() { return permissionCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
