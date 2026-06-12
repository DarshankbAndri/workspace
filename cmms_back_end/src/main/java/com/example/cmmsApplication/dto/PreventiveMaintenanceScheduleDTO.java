package com.example.cmmsApplication.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PreventiveMaintenanceScheduleDTO {
    private Long id;
    private String scheduleCode;
    @NotNull(message = "Equipment is required")
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long vendorId;
    private String vendorName;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    @NotBlank(message = "Frequency is required")
    private String frequency;
    private String priority;
    private String assignedTo;
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextDueDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastGeneratedDate;
    private Boolean active;
    private String lastNotificationStatus;
    private LocalDateTime lastNotificationAt;
    private long generatedWorkOrders;
    private long completedWorkOrders;
    private BigDecimal completionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getScheduleCode() { return scheduleCode; }
    public void setScheduleCode(String scheduleCode) { this.scheduleCode = scheduleCode; }
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
    public LocalDate getLastGeneratedDate() { return lastGeneratedDate; }
    public void setLastGeneratedDate(LocalDate lastGeneratedDate) { this.lastGeneratedDate = lastGeneratedDate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getLastNotificationStatus() { return lastNotificationStatus; }
    public void setLastNotificationStatus(String lastNotificationStatus) { this.lastNotificationStatus = lastNotificationStatus; }
    public LocalDateTime getLastNotificationAt() { return lastNotificationAt; }
    public void setLastNotificationAt(LocalDateTime lastNotificationAt) { this.lastNotificationAt = lastNotificationAt; }
    public long getGeneratedWorkOrders() { return generatedWorkOrders; }
    public void setGeneratedWorkOrders(long generatedWorkOrders) { this.generatedWorkOrders = generatedWorkOrders; }
    public long getCompletedWorkOrders() { return completedWorkOrders; }
    public void setCompletedWorkOrders(long completedWorkOrders) { this.completedWorkOrders = completedWorkOrders; }
    public BigDecimal getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(BigDecimal completionPercentage) { this.completionPercentage = completionPercentage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
