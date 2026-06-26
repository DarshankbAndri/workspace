package com.example.cmmsApplication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Immutable
@Subselect("""
        SELECT
            e.employee_id AS id,
            e.employee_code AS employee_code,
            e.first_name AS first_name,
            e.last_name AS last_name,
            e.mobile_number AS mobile_number,
            e.email AS email,
            e.gender AS gender,
            e.date_of_birth AS date_of_birth,
            e.date_of_joining AS date_of_joining,
            e.designation AS designation,
            e.department AS department,
            e.status AS status,
            primary_site.site_id AS site_id,
            primary_site.site_name AS site_name,
            COALESCE(site_counts.assigned_site_count, 0) AS assigned_site_count,
            e.created_at AS created_at,
            e.updated_at AS updated_at
        FROM employee_master e
        LEFT JOIN (
            SELECT DISTINCT ON (esa.employee_id) esa.employee_id, s.site_id, s.site_name
            FROM employee_site_assignment esa
            JOIN site_master s ON s.site_id = esa.site_id
            WHERE esa.status <> 'INACTIVE'
            ORDER BY esa.employee_id, esa.is_primary_site DESC, s.site_name
        ) primary_site ON primary_site.employee_id = e.employee_id
        LEFT JOIN (
            SELECT employee_id, COUNT(*) AS assigned_site_count
            FROM employee_site_assignment
            WHERE status <> 'INACTIVE'
            GROUP BY employee_id
        ) site_counts ON site_counts.employee_id = e.employee_id
        """)
public class EmployeeList {
    @Id
    private Long id;
    @Column(name = "employee_code")
    private String employeeCode;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "last_name")
    private String lastName;
    @Column(name = "mobile_number")
    private String mobileNumber;
    private String email;
    private String gender;
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;
    private String designation;
    private String department;
    private String status;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "site_name")
    private String siteName;
    @Column(name = "assigned_site_count")
    private Integer assignedSiteCount;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getEmployeeCode() { return employeeCode; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getMobileNumber() { return mobileNumber; }
    public String getEmail() { return email; }
    public String getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public String getDesignation() { return designation; }
    public String getDepartment() { return department; }
    public String getStatus() { return status; }
    public Long getSiteId() { return siteId; }
    public String getSiteName() { return siteName; }
    public Integer getAssignedSiteCount() { return assignedSiteCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
