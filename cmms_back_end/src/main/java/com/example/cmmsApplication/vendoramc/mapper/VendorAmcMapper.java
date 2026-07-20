package com.example.cmmsApplication.vendoramc.mapper;

import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import com.example.cmmsApplication.vendoramc.dto.EquipmentAmcMappingDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcContractDTO;
import com.example.cmmsApplication.vendoramc.entity.EquipmentAmcMapping;
import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class VendorAmcMapper {
    public VendorAmcContractDTO toDTO(VendorAmcContract contract, List<EquipmentAmcMapping> mappings) {
        if (contract == null) {
            return null;
        }
        Vendor vendor = contract.getVendor();
        Site site = contract.getSite();
        List<EquipmentAmcMappingDTO> mappingDTOs = mappings == null ? List.of() : mappings.stream().map(this::toDTO).toList();
        return VendorAmcContractDTO.builder()
                .id(contract.getId())
                .siteId(site == null ? null : site.getId())
                .siteCode(site == null ? null : site.getSiteCode())
                .siteName(site == null ? null : site.getSiteName())
                .vendorId(vendor == null ? null : vendor.getId())
                .vendorName(vendor == null ? null : vendor.getVendorName())
                .contractNumber(contract.getContractNumber())
                .contractName(contract.getContractName())
                .contractType(contract.getContractType())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .contractValue(contract.getContractValue())
                .coverageDescription(contract.getCoverageDescription())
                .responseTimeHours(contract.getResponseTimeHours())
                .resolutionTimeHours(contract.getResolutionTimeHours())
                .includesLabor(contract.getIncludesLabor())
                .includesSpares(contract.getIncludesSpares())
                .status(contract.getStatus())
                .contactPerson(contract.getContactPerson())
                .contactPhone(contract.getContactPhone())
                .contactEmail(contract.getContactEmail())
                .remarks(contract.getRemarks())
                .renewedFromContractId(contract.getRenewedFromContract() == null ? null : contract.getRenewedFromContract().getId())
                .coveredEquipmentCount(mappingDTOs.size())
                .daysRemaining(daysRemaining(contract.getEndDate()))
                .equipmentMappings(mappingDTOs)
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }

    public EquipmentAmcMappingDTO toDTO(EquipmentAmcMapping mapping) {
        if (mapping == null) {
            return null;
        }
        Equipment equipment = mapping.getEquipment();
        return EquipmentAmcMappingDTO.builder()
                .id(mapping.getId())
                .amcContractId(mapping.getAmcContract() == null ? null : mapping.getAmcContract().getId())
                .equipmentId(equipment == null ? null : equipment.getId())
                .equipmentCode(equipment == null ? null : equipment.getEquipmentCode())
                .equipmentName(equipment == null ? null : equipment.getEquipmentName())
                .siteId(equipment == null || equipment.getSite() == null ? null : equipment.getSite().getId())
                .siteName(equipment == null || equipment.getSite() == null ? null : equipment.getSite().getSiteName())
                .coverageType(mapping.getCoverageType())
                .coverageStartDate(mapping.getCoverageStartDate())
                .coverageEndDate(mapping.getCoverageEndDate())
                .remarks(mapping.getRemarks())
                .active(mapping.getActive())
                .createdAt(mapping.getCreatedAt())
                .updatedAt(mapping.getUpdatedAt())
                .build();
    }

    private Long daysRemaining(LocalDate endDate) {
        return endDate == null ? null : ChronoUnit.DAYS.between(LocalDate.now(), endDate);
    }
}
