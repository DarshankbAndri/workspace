package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.dto.SparePartImportResultDTO;
import com.example.cmmsApplication.dto.SparePartDTO;
import com.example.cmmsApplication.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.dto.StockTransferDTO;
import com.example.cmmsApplication.service.SparePartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/spare-parts")
public class SparePartController {
    private final SparePartService sparePartService;

    public SparePartController(SparePartService sparePartService) {
        this.sparePartService = sparePartService;
    }

    @PostMapping
    public ResponseEntity<SparePartDTO> create(@Valid @RequestBody SparePartDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sparePartService.create(dto));
    }

    @PutMapping("/{stockId}")
    public ResponseEntity<SparePartDTO> update(@PathVariable Long stockId, @Valid @RequestBody SparePartDTO dto) {
        return ResponseEntity.ok(sparePartService.update(stockId, dto));
    }

    @DeleteMapping("/{stockId}")
    public ResponseEntity<Void> delete(@PathVariable Long stockId) {
        sparePartService.delete(stockId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{stockId}")
    public ResponseEntity<SparePartDTO> getById(@PathVariable Long stockId) {
        return ResponseEntity.ok(sparePartService.getByStockId(stockId));
    }

    @GetMapping("/site/{siteId}")
    public ResponseEntity<List<SparePartDTO>> getBySite(@PathVariable Long siteId) {
        return ResponseEntity.ok(sparePartService.getActiveBySite(siteId));
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(sparePartService.search(searchDTO));
    }

    @GetMapping("/{stockId}/transactions")
    public ResponseEntity<List<SparePartTransactionDTO>> getTransactions(@PathVariable Long stockId) {
        return ResponseEntity.ok(sparePartService.getTransactions(stockId));
    }

    @PostMapping("/{stockId}/stock-in")
    public ResponseEntity<SparePartTransactionDTO> stockIn(@PathVariable Long stockId,
                                                           @Valid @RequestBody SparePartTransactionDTO dto) {
        return ResponseEntity.ok(sparePartService.stockIn(stockId, dto));
    }

    @PostMapping("/{stockId}/adjust")
    public ResponseEntity<SparePartTransactionDTO> adjust(@PathVariable Long stockId,
                                                          @Valid @RequestBody SparePartTransactionDTO dto) {
        return ResponseEntity.ok(sparePartService.adjustStock(stockId, dto));
    }

    @PostMapping("/{stockId}/transfer")
    public ResponseEntity<List<SparePartTransactionDTO>> transfer(@PathVariable Long stockId,
                                                                  @Valid @RequestBody StockTransferDTO dto) {
        return ResponseEntity.ok(sparePartService.transferStock(stockId, dto));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SparePartImportResultDTO> importFile(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(sparePartService.importSpareParts(file));
    }
}
