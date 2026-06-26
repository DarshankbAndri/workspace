package com.example.cmmsApplication.spareparts.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import com.example.cmmsApplication.site.entity.Site;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTransferDTO {
    @NotNull(message = "Target site is required")
    private Long targetSiteId;
    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;
    private String targetStorageLocation;
    private String remarks;

}
