package com.example.cmmsApplication.user.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.example.cmmsApplication.common.time.CurrentTimeProvider;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.user.enums.UserRole;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private UserRole role;
    
    @Column(nullable = false)
    private String department;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;
    
    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    private java.util.List<User> subordinates;
    
    @Column(nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
    
    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "profile_photo_path", length = 500)
    private String profilePhotoPath;

// All-args constructor
    public User(Long id, String username, String email, String firstName, String lastName, 
                UserRole role, String department, User manager, java.util.List<User> subordinates,
                Instant createdAt, Instant updatedAt, Boolean active) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.department = department;
        this.manager = manager;
        this.subordinates = subordinates;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
    }

@PrePersist
    protected void onCreate() {
        createdAt = CurrentTimeProvider.now();
        updatedAt = CurrentTimeProvider.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = CurrentTimeProvider.now();
    }
}
