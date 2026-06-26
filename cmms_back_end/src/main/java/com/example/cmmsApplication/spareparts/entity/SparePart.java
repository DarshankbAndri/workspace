package com.example.cmmsApplication.spareparts.entity;


import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.vendor.entity.Vendor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_part_master")
@Getter
@Setter
@NoArgsConstructor
public class SparePart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "spare_part_id")
    private Long id;

    @Column(name = "part_code", nullable = false, unique = true, length = 80)
    private String partCode;

    @Column(name = "part_name", nullable = false, length = 180)
    private String partName;

    private String description;

    @Column(length = 100)
    private String category;

    @Column(nullable = false, length = 30)
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_vendor_id")
    private Vendor preferredVendor;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
