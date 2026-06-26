package com.example.cmmsApplication.spareparts.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartDTO {
    private Long id;
    private Long sparePartId;
    @NotBlank(message = "Part code is required")
    private String partCode;
    @NotBlank(message = "Part name is required")
    private String partName;
    private String description;
    private String category;
    @NotBlank(message = "Unit is required")
    private String unit;
    private Long preferredVendorId;
    private String preferredVendorName;
    private String status;
    private Long stockId;
    @NotNull(message = "Site is required")
    private Long siteId;
    private String siteCode;
    private String siteName;
    private BigDecimal currentStock;
    private BigDecimal reservedStock;
    private BigDecimal availableStock;
    private BigDecimal minimumStock;
    private BigDecimal unitCost;
    private String storageLocation;
    private Boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
