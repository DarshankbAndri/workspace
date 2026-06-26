package com.example.cmmsApplication.spareparts.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartReorderDTO {
    private Long id;
    @NotNull(message = "Stock item is required")
    private Long stockId;
    private Long sparePartId;
    private String partCode;
    private String partName;
    private Long siteId;
    private String siteName;
    private Long assignmentId;
    private Long spareRequestId;
    private Long vendorId;
    private String vendorName;
    @NotNull(message = "Requested quantity is required")
    private BigDecimal requestedQuantity;
    private BigDecimal estimatedUnitCost;
    private BigDecimal estimatedTotalCost;
    private String status;
    private LocalDate expectedDate;
    private String remarks;
    private Long requestedBy;
    private String requestedByName;
    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;

}
