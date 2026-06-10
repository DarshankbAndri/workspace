package com.example.travelreimbursement.dto;

import com.example.travelreimbursement.entity.ClaimStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Schema(description = "Data Transfer Object for Travel Claim information")
public class ClaimDTO {
    
    @Schema(description = "Claim ID", example = "1")
    private Long id;

    @Schema(description = "Project name for the travel", example = "New Office Launch")
    private String projectName;

    @Schema(description = "Travel purpose or summary", example = "Client visit and training")
    private String travelPurpose;

    @Schema(description = "Travel from date")
    private LocalDate travelFromDate;

    @Schema(description = "Travel from time")
    private LocalTime travelFromTime;

    @Schema(description = "Travel to date")
    private LocalDate travelToDate;

    @Schema(description = "Travel to time")
    private LocalTime travelToTime;

    @Schema(description = "From location", example = "Mumbai")
    private String fromLocation;

    @Schema(description = "To location", example = "Delhi")
    private String toLocation;
    
    @NotBlank(message = "Description is required")
    @Schema(description = "Travel claim description", example = "Daily expenses for client visit")
    private String description;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    @Schema(description = "Claim amount", example = "2500.00")
    private BigDecimal amount;
    
    @Schema(description = "Current claim status", example = "DRAFT")
    private ClaimStatus status;
    
    @Schema(description = "Rejection reason if rejected")
    private String rejectionReason;
    
    @Schema(description = "User ID who submitted the claim", example = "1")
    private Long userId;
    
    @Schema(description = "Manager ID for approval", example = "2")
    private Long managerId;

    @Schema(description = "Daily Allowance entries (legacy)")
    private List<DailySummaryDTO> dailySummary;

    @Schema(description = "Hotel entries")
    private List<HotelDTO> hotel;

    @Schema(description = "Telephone / internet entries")
    private List<TelephoneDTO> telephone;

    @Schema(description = "Taxi entries")
    private List<TaxiDTO> taxi;

    @Schema(description = "Miscellaneous entries")
    private List<MiscellaneousDTO> miscellaneous;

    @Schema(description = "Other trip expense entries")
    private List<OtherExpenseDTO> otherExpenses;

    @Schema(description = "Bills Paid By Company entries")
    private List<BillsPaidByCompanyDTO> billsPaidByCompany;
    
    @Schema(description = "Claim creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Claim submission timestamp")
    private LocalDateTime submittedAt;
    
    @Schema(description = "Manager approval timestamp")
    private LocalDateTime approvedAt;
    
    @Schema(description = "Payment completion timestamp")
    private LocalDateTime paidAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
    
    public ClaimDTO() {
    }
    
    public ClaimDTO(Long id, String projectName, String travelPurpose, LocalDate travelFromDate,
                    LocalTime travelFromTime, LocalDate travelToDate, LocalTime travelToTime,
                    String fromLocation, String toLocation, String description, BigDecimal amount,
                    ClaimStatus status, String rejectionReason, Long userId, Long managerId,
                    List<DailySummaryDTO> dailySummary, List<HotelDTO> hotel,
                    List<TelephoneDTO> telephone, List<TaxiDTO> taxi,
                    List<MiscellaneousDTO> miscellaneous, List<OtherExpenseDTO> otherExpenses,
                    LocalDateTime createdAt, LocalDateTime submittedAt,
                    LocalDateTime approvedAt, LocalDateTime paidAt, LocalDateTime updatedAt) {
        this.id = id;
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
        this.userId = userId;
        this.managerId = managerId;
        this.dailySummary = dailySummary;
        this.hotel = hotel;
        this.telephone = telephone;
        this.taxi = taxi;
        this.miscellaneous = miscellaneous;
        this.otherExpenses = otherExpenses;
        this.createdAt = createdAt;
        this.submittedAt = submittedAt;
        this.approvedAt = approvedAt;
        this.paidAt = paidAt;
        this.updatedAt = updatedAt;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getManagerId() {
        return managerId;
    }
    
    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }


    public List<DailySummaryDTO> getDailySummary() {
        return dailySummary;
    }

    public void setDailySummary(List<DailySummaryDTO> dailySummary) {
        this.dailySummary = dailySummary;
    }

    public List<HotelDTO> getHotel() {
        return hotel;
    }

    public void setHotel(List<HotelDTO> hotel) {
        this.hotel = hotel;
    }

    public List<TelephoneDTO> getTelephone() {
        return telephone;
    }

    public void setTelephone(List<TelephoneDTO> telephone) {
        this.telephone = telephone;
    }

    public List<TaxiDTO> getTaxi() {
        return taxi;
    }

    public void setTaxi(List<TaxiDTO> taxi) {
        this.taxi = taxi;
    }

    public List<MiscellaneousDTO> getMiscellaneous() {
        return miscellaneous;
    }

    public void setMiscellaneous(List<MiscellaneousDTO> miscellaneous) {
        this.miscellaneous = miscellaneous;
    }

    public List<OtherExpenseDTO> getOtherExpenses() {
        return otherExpenses;
    }

    public void setOtherExpenses(List<OtherExpenseDTO> otherExpenses) {
        this.otherExpenses = otherExpenses;
    }

    public List<BillsPaidByCompanyDTO> getBillsPaidByCompany() {
        return billsPaidByCompany;
    }

    public void setBillsPaidByCompany(List<BillsPaidByCompanyDTO> billsPaidByCompany) {
        this.billsPaidByCompany = billsPaidByCompany;
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
}
