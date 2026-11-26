package com.example.cmmsApplication.spareparts.service;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartImportResultDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.spareparts.dto.StockTransferDTO;
import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;

/** Service contract for spare part. */
public interface SparePartService {
    SparePartDTO create(SparePartDTO dto);

    SparePartDTO update(Long stockId, SparePartDTO dto);

    void delete(Long stockId);

    SparePartDTO getByStockId(Long stockId);

    PageProperties search(SearchDTO searchDTO);

    List<SparePartDTO> getActiveBySite(Long siteId);

    SparePartTransactionDTO stockIn(Long stockId, SparePartTransactionDTO dto);

    SparePartTransactionDTO adjustStock(Long stockId, SparePartTransactionDTO dto);

    List<SparePartTransactionDTO> transferStock(Long sourceStockId, StockTransferDTO dto);

    SparePartImportResultDTO importSpareParts(MultipartFile file);

    List<SparePartTransactionDTO> getTransactions(Long stockId);

    SparePartSiteStock consumeStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks);

    SparePartSiteStock reserveStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks);

    SparePartSiteStock releaseReservedStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks);

    SparePartSiteStock issueReservedStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks);

    SparePartSiteStock issueStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks);

    SparePartSiteStock returnStock(Long stockId, BigDecimal quantity, Long assignmentId, String remarks);

    SparePartSiteStock getStockEntity(Long stockId);
}
