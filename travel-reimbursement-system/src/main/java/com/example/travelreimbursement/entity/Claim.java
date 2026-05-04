package com.example.travelreimbursement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "claims")
public class Claim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id")
    private User manager;
    
    @Column(name = "project_name")
    private String projectName;

    @Column(name = "travel_purpose")
    private String travelPurpose;

    @Column(name = "travel_from_date")
    private LocalDate travelFromDate;

    @Column(name = "travel_from_time")
    private LocalTime travelFromTime;

    @Column(name = "travel_to_date")
    private LocalDate travelToDate;

    @Column(name = "travel_to_time")
    private LocalTime travelToTime;

    @Column(name = "from_location")
    private String fromLocation;

    @Column(name = "to_location")
    private String toLocation;
    
    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private ClaimStatus status = ClaimStatus.DRAFT;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime submittedAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime approvedAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime paidAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DailySummaryEntry> dailySummaryEntries;

    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HotelEntry> hotelEntries;

    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TelephoneEntry> telephoneEntries;

    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaxiEntry> taxiEntries;

    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MiscellaneousEntry> miscellaneousEntries;

    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OtherExpenseEntry> otherExpenseEntries;
    
    // Default constructor
    public Claim() {
    }
    
    // All-args constructor
    public Claim(Long id, User user, User manager, String projectName, String travelPurpose,
                 LocalDate travelFromDate, LocalTime travelFromTime, LocalDate travelToDate,
                 LocalTime travelToTime, String fromLocation, String toLocation, String description,
                 BigDecimal amount, ClaimStatus status, String rejectionReason,
                 LocalDateTime createdAt, LocalDateTime submittedAt, LocalDateTime approvedAt,
                 LocalDateTime paidAt, LocalDateTime updatedAt,
                 List<DailySummaryEntry> dailySummaryEntries,
                 List<HotelEntry> hotelEntries,
                 List<TelephoneEntry> telephoneEntries,
                 List<TaxiEntry> taxiEntries,
                 List<MiscellaneousEntry> miscellaneousEntries,
                 List<OtherExpenseEntry> otherExpenseEntries) {
        this.id = id;
        this.user = user;
        this.manager = manager;
        this.projectName = projectName;
        this.travelPurpose = travelPurpose;
        this.travelFromDate = travelFromDate;
        this.travelFromTime = travelFromTime;
        this.travelToDate = travelToDate;
        this.travelToTime = travelToTime;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.description = description;
        this.amount = amount;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.submittedAt = submittedAt;
        this.approvedAt = approvedAt;
        this.paidAt = paidAt;
        this.updatedAt = updatedAt;
        this.dailySummaryEntries = dailySummaryEntries;
        this.hotelEntries = hotelEntries;
        this.telephoneEntries = telephoneEntries;
        this.taxiEntries = taxiEntries;
        this.miscellaneousEntries = miscellaneousEntries;
        this.otherExpenseEntries = otherExpenseEntries;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public User getManager() {
        return manager;
    }
    
    public void setManager(User manager) {
        this.manager = manager;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getTravelPurpose() {
        return travelPurpose;
    }

    public void setTravelPurpose(String travelPurpose) {
        this.travelPurpose = travelPurpose;
    }

    public LocalDate getTravelFromDate() {
        return travelFromDate;
    }

    public void setTravelFromDate(LocalDate travelFromDate) {
        this.travelFromDate = travelFromDate;
    }

    public LocalTime getTravelFromTime() {
        return travelFromTime;
    }

    public void setTravelFromTime(LocalTime travelFromTime) {
        this.travelFromTime = travelFromTime;
    }

    public LocalDate getTravelToDate() {
        return travelToDate;
    }

    public void setTravelToDate(LocalDate travelToDate) {
        this.travelToDate = travelToDate;
    }

    public LocalTime getTravelToTime() {
        return travelToTime;
    }

    public void setTravelToTime(LocalTime travelToTime) {
        this.travelToTime = travelToTime;
    }

    public String getFromLocation() {
        return fromLocation;
    }

    public void setFromLocation(String fromLocation) {
        this.fromLocation = fromLocation;
    }

    public String getToLocation() {
        return toLocation;
    }

    public void setToLocation(String toLocation) {
        this.toLocation = toLocation;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public ClaimStatus getStatus() {
        return status;
    }
    
    public void setStatus(ClaimStatus status) {
        this.status = status;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }
    
    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<DailySummaryEntry> getDailySummaryEntries() {
        return dailySummaryEntries;
    }

    public void setDailySummaryEntries(List<DailySummaryEntry> dailySummaryEntries) {
        this.dailySummaryEntries = dailySummaryEntries;
    }

    public List<HotelEntry> getHotelEntries() {
        return hotelEntries;
    }

    public void setHotelEntries(List<HotelEntry> hotelEntries) {
        this.hotelEntries = hotelEntries;
    }

    public List<TelephoneEntry> getTelephoneEntries() {
        return telephoneEntries;
    }

    public void setTelephoneEntries(List<TelephoneEntry> telephoneEntries) {
        this.telephoneEntries = telephoneEntries;
    }

    public List<TaxiEntry> getTaxiEntries() {
        return taxiEntries;
    }

    public void setTaxiEntries(List<TaxiEntry> taxiEntries) {
        this.taxiEntries = taxiEntries;
    }

    public List<MiscellaneousEntry> getMiscellaneousEntries() {
        return miscellaneousEntries;
    }

    public void setMiscellaneousEntries(List<MiscellaneousEntry> miscellaneousEntries) {
        this.miscellaneousEntries = miscellaneousEntries;
    }

    public List<OtherExpenseEntry> getOtherExpenseEntries() {
        return otherExpenseEntries;
    }

    public void setOtherExpenseEntries(List<OtherExpenseEntry> otherExpenseEntries) {
        this.otherExpenseEntries = otherExpenseEntries;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
