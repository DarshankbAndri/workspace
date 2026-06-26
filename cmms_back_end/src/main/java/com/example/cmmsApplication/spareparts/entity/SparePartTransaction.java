package com.example.cmmsApplication.spareparts.entity;


import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_part_transaction")
@Getter
@Setter
@NoArgsConstructor
public class SparePartTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private SparePartSiteStock stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "transaction_type", nullable = false, length = 40)
    private String transactionType;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "stock_before", nullable = false, precision = 14, scale = 3)
    private BigDecimal stockBefore;

    @Column(name = "stock_after", nullable = false, precision = 14, scale = 3)
    private BigDecimal stockAfter;

    @Column(name = "reference_type", length = 80)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
    }

}
