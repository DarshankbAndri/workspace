package com.example.cmmsApplication.spareparts.entity;


import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_part_site_stock")
@Getter
@Setter
@NoArgsConstructor
public class SparePartSiteStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "current_stock", nullable = false, precision = 14, scale = 3)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "reserved_stock", nullable = false, precision = 14, scale = 3)
    private BigDecimal reservedStock = BigDecimal.ZERO;

    @Column(name = "minimum_stock", nullable = false, precision = 14, scale = 3)
    private BigDecimal minimumStock = BigDecimal.ZERO;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "storage_location", length = 150)
    private String storageLocation;

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

public BigDecimal getAvailableStock() {
        BigDecimal current = currentStock == null ? BigDecimal.ZERO : currentStock;
        BigDecimal reserved = reservedStock == null ? BigDecimal.ZERO : reservedStock;
        return current.subtract(reserved);
    }

}
