package com.example.travelreimbursement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Daily summary expense entry")
public class DailySummaryDTO {

    @Schema(description = "Entry description", example = "Lunch provided by company")
    private String description;

    @Schema(description = "Daily amount", example = "150.00")
    private BigDecimal amount;

    @Schema(description = "Number of days", example = "2")
    private Integer days;

    @Schema(description = "Line total amount", example = "300.00")
    private BigDecimal total;

    public DailySummaryDTO() {
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

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
