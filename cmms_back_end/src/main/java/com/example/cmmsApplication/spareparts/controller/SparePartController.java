package com.example.cmmsApplication.spareparts.controller;


import lombok.RequiredArgsConstructor;
import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.equipment.dto.EquipmentSpareBomDTO;
import com.example.cmmsApplication.equipment.service.EquipmentSpareBomService;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartImportResultDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartTransactionDTO;
import com.example.cmmsApplication.spareparts.dto.StockTransferDTO;
import com.example.cmmsApplication.spareparts.service.SparePartService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/spare-parts")
@RequiredArgsConstructor
public class SparePartController {
    private final SparePartService sparePartService;
    private final EquipmentSpareBomService equipmentSpareBomService;

@PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody SparePartDTO dto) {
        return ResponseFactory.created(sparePartService.create(dto));
    }

    @PutMapping("/{stockId}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long stockId, @Valid @RequestBody SparePartDTO dto) {
        return ResponseFactory.ok(sparePartService.update(stockId, dto));
    }

    @DeleteMapping("/{stockId}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long stockId) {
        sparePartService.delete(stockId);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{stockId}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long stockId) {
        return ResponseFactory.ok(sparePartService.getByStockId(stockId));
    }

    @GetMapping("/site/{siteId}")
    public ResponseEntity<ApiResponse<?>> getBySite(@PathVariable Long siteId) {
        return ResponseFactory.ok(sparePartService.getActiveBySite(siteId));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(sparePartService.search(searchDTO));
    }

    @GetMapping("/{stockId}/transactions")
    public ResponseEntity<ApiResponse<?>> getTransactions(@PathVariable Long stockId) {
        return ResponseFactory.ok(sparePartService.getTransactions(stockId));
    }

    @GetMapping("/{stockId}/equipment-bom")
    public ResponseEntity<ApiResponse<?>> getEquipmentBom(@PathVariable Long stockId) {
        return ResponseFactory.ok(equipmentSpareBomService.getByStock(stockId));
    }

    @PostMapping("/{stockId}/equipment-bom")
    public ResponseEntity<ApiResponse<?>> createEquipmentBom(@PathVariable Long stockId,
                                                             @RequestBody EquipmentSpareBomDTO dto) {
        return ResponseFactory.created(equipmentSpareBomService.createForStock(stockId, dto));
    }

    @PutMapping("/{stockId}/equipment-bom/{bomId}")
    public ResponseEntity<ApiResponse<?>> updateEquipmentBom(@PathVariable Long stockId,
                                                             @PathVariable Long bomId,
                                                             @RequestBody EquipmentSpareBomDTO dto) {
        return ResponseFactory.ok(equipmentSpareBomService.updateForStock(stockId, bomId, dto));
    }

    @DeleteMapping("/{stockId}/equipment-bom/{bomId}")
    public ResponseEntity<ApiResponse<?>> deleteEquipmentBom(@PathVariable Long stockId,
                                                             @PathVariable Long bomId) {
        equipmentSpareBomService.deleteForStock(stockId, bomId);
        return ResponseFactory.ok(null);
    }

    @PostMapping("/{stockId}/stock-in")
    public ResponseEntity<ApiResponse<?>> stockIn(@PathVariable Long stockId,
                                                           @Valid @RequestBody SparePartTransactionDTO dto) {
        return ResponseFactory.ok(sparePartService.stockIn(stockId, dto));
    }

    @PostMapping("/{stockId}/adjust")
    public ResponseEntity<ApiResponse<?>> adjust(@PathVariable Long stockId,
                                                          @Valid @RequestBody SparePartTransactionDTO dto) {
        return ResponseFactory.ok(sparePartService.adjustStock(stockId, dto));
    }

    @PostMapping("/{stockId}/transfer")
    public ResponseEntity<ApiResponse<?>> transfer(@PathVariable Long stockId,
                                                                  @Valid @RequestBody StockTransferDTO dto) {
        return ResponseFactory.ok(sparePartService.transferStock(stockId, dto));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> importFile(@RequestPart("file") MultipartFile file) {
        return ResponseFactory.ok(sparePartService.importSpareParts(file));
    }
}
