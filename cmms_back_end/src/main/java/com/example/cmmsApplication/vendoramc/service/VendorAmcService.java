package com.example.cmmsApplication.vendoramc.service;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.vendoramc.dto.EquipmentAmcMappingDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcContractDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcDashboardDTO;
import com.example.cmmsApplication.vendoramc.dto.VendorAmcPmScheduleDTO;
import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import java.util.List;

/** Service contract for vendor amc. */
public interface VendorAmcService {
    VendorAmcContractDTO createAmcContract(VendorAmcContractDTO dto);

    VendorAmcContractDTO updateAmcContract(Long id, VendorAmcContractDTO dto);

    VendorAmcContractDTO getAmcContract(Long id);

    PageProperties searchAmcContracts(SearchDTO searchDTO);

    void deleteAmcContract(Long id);

    EquipmentAmcMappingDTO mapEquipment(Long contractId, EquipmentAmcMappingDTO dto);

    void removeEquipmentMapping(Long contractId, Long equipmentId);

    List<EquipmentAmcMappingDTO> getContractEquipment(Long contractId);

    List<VendorAmcPmScheduleDTO> getLinkedPmSchedules(Long contractId);

    List<VendorAmcContractDTO> getVendorAmcContracts(Long vendorId);

    VendorAmcContractDTO getActiveAmcForEquipment(Long equipmentId);

    List<VendorAmcContractDTO> getAmcContractsForEquipment(Long equipmentId);

    VendorAmcContractDTO renewAmcContract(Long id, VendorAmcContractDTO dto);

    VendorAmcDashboardDTO getDashboard();

    VendorAmcDashboardDTO getDashboard(Long siteId);

    void scanExpiryStatus();

    VendorAmcContract getEntity(Long id);
}
