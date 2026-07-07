package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.equipment.dto.EquipmentSpareBomDTO;
import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.entity.EquipmentSpareBom;
import com.example.cmmsApplication.equipment.repository.EquipmentSpareBomRepository;
import com.example.cmmsApplication.spareparts.dao.SparePartSiteStockDAO;
import com.example.cmmsApplication.spareparts.entity.SparePart;
import com.example.cmmsApplication.spareparts.entity.SparePartSiteStock;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentSpareBomService {
    private static final Set<String> CRITICALITIES = Set.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
    private static final Set<String> STATUSES = Set.of("ACTIVE", "INACTIVE");

    private final EquipmentService equipmentService;
    private final EquipmentSpareBomRepository bomRepository;
    private final SparePartSiteStockDAO stockDAO;
    private final AccessControlService accessControlService;

    @Transactional(readOnly = true)
    public List<EquipmentSpareBomDTO> getByEquipment(Long equipmentId) {
        Equipment equipment = getAccessibleEquipment(equipmentId);
        return bomRepository.findByEquipmentIdOrderByCriticalityAscBomIdDesc(equipment.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EquipmentSpareBomDTO create(Long equipmentId, EquipmentSpareBomDTO dto) {
        Equipment equipment = getAccessibleEquipment(equipmentId);
        SparePartSiteStock stock = getValidStock(dto == null ? null : dto.getStockId(), equipment);
        if (bomRepository.existsByEquipmentIdAndStockId(equipmentId, stock.getId())) {
            throw new InvalidOperationException("This spare part is already defined in the equipment BOM.");
        }
        EquipmentSpareBom bom = new EquipmentSpareBom();
        bom.setEquipment(equipment);
        bom.setStock(stock);
        bom.setSparePart(stock.getSparePart());
        apply(bom, dto);
        return toDTO(bomRepository.save(bom));
    }

    public EquipmentSpareBomDTO update(Long equipmentId, Long bomId, EquipmentSpareBomDTO dto) {
        Equipment equipment = getAccessibleEquipment(equipmentId);
        EquipmentSpareBom bom = getOwnedBom(equipmentId, bomId);
        SparePartSiteStock stock = getValidStock(dto == null ? null : dto.getStockId(), equipment);
        if (bomRepository.existsByEquipmentIdAndStockIdAndBomIdNot(equipmentId, stock.getId(), bomId)) {
            throw new InvalidOperationException("This spare part is already defined in the equipment BOM.");
        }
        bom.setStock(stock);
        bom.setSparePart(stock.getSparePart());
        apply(bom, dto);
        return toDTO(bomRepository.save(bom));
    }

    public void delete(Long equipmentId, Long bomId) {
        getAccessibleEquipment(equipmentId);
        EquipmentSpareBom bom = getOwnedBom(equipmentId, bomId);
        bomRepository.delete(bom);
    }

    private EquipmentSpareBom getOwnedBom(Long equipmentId, Long bomId) {
        return bomRepository.findByBomIdAndEquipmentId(bomId, equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment spare BOM line not found with id: " + bomId));
    }

    private Equipment getAccessibleEquipment(Long equipmentId) {
        Equipment equipment = equipmentService.getEntity(equipmentId);
        accessControlService.validateSiteAccess(equipment.getSite() == null ? null : equipment.getSite().getId());
        return equipment;
    }

    private SparePartSiteStock getValidStock(Long stockId, Equipment equipment) {
        if (stockId == null) {
            throw new InvalidOperationException("Spare part stock is required.");
        }
        SparePartSiteStock stock = stockDAO.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part stock not found with id: " + stockId));
        Long equipmentSiteId = equipment.getSite() == null ? null : equipment.getSite().getId();
        Long stockSiteId = stock.getSite() == null ? null : stock.getSite().getId();
        accessControlService.validateSiteAccess(stockSiteId);
        if (equipmentSiteId == null || stockSiteId == null || !equipmentSiteId.equals(stockSiteId)) {
            throw new InvalidOperationException("BOM spare stock site must match equipment site.");
        }
        if (!"ACTIVE".equalsIgnoreCase(stock.getStatus()) || stock.getSparePart() == null || !"ACTIVE".equalsIgnoreCase(stock.getSparePart().getStatus())) {
            throw new InvalidOperationException("Only active spare parts can be added to equipment BOM.");
        }
        return stock;
    }

    private void apply(EquipmentSpareBom bom, EquipmentSpareBomDTO dto) {
        if (dto == null) {
            throw new InvalidOperationException("Equipment spare BOM details are required.");
        }
        bom.setRecommendedQty(positive(dto.getRecommendedQty(), "Recommended quantity"));
        bom.setCriticality(normalizeAllowed(dto.getCriticality(), "MEDIUM", CRITICALITIES, "Criticality"));
        bom.setReplacementFrequency(blankToNull(dto.getReplacementFrequency()));
        bom.setRemarks(blankToNull(dto.getRemarks()));
        bom.setStatus(normalizeAllowed(dto.getStatus(), "ACTIVE", STATUSES, "Status"));
    }

    private BigDecimal positive(BigDecimal value, String label) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException(label + " must be greater than zero.");
        }
        return value;
    }

    private String normalizeAllowed(String value, String fallback, Set<String> allowed, String label) {
        String normalized = value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(normalized)) {
            throw new InvalidOperationException(label + " must be one of: " + String.join(", ", allowed));
        }
        return normalized;
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private EquipmentSpareBomDTO toDTO(EquipmentSpareBom bom) {
        SparePartSiteStock stock = bom.getStock();
        SparePart part = bom.getSparePart();
        return EquipmentSpareBomDTO.builder()
                .bomId(bom.getBomId())
                .equipmentId(bom.getEquipment() == null ? null : bom.getEquipment().getId())
                .stockId(stock == null ? null : stock.getId())
                .sparePartId(part == null ? null : part.getId())
                .partCode(part == null ? null : part.getPartCode())
                .partName(part == null ? null : part.getPartName())
                .category(part == null ? null : part.getCategory())
                .unit(part == null ? null : part.getUnit())
                .siteId(stock == null || stock.getSite() == null ? null : stock.getSite().getId())
                .siteName(stock == null || stock.getSite() == null ? null : stock.getSite().getSiteName())
                .currentStock(stock == null ? null : stock.getCurrentStock())
                .reservedStock(stock == null ? null : stock.getReservedStock())
                .availableStock(stock == null ? null : stock.getAvailableStock())
                .minimumStock(stock == null ? null : stock.getMinimumStock())
                .recommendedQty(bom.getRecommendedQty())
                .criticality(bom.getCriticality())
                .replacementFrequency(bom.getReplacementFrequency())
                .remarks(bom.getRemarks())
                .status(bom.getStatus())
                .createdAt(bom.getCreatedAt())
                .updatedAt(bom.getUpdatedAt())
                .build();
    }
}
