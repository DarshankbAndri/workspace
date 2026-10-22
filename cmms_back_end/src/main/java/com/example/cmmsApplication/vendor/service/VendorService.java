package com.example.cmmsApplication.vendor.service;

import com.example.cmmsApplication.vendor.dto.VendorDTO;
import com.example.cmmsApplication.vendor.entity.Vendor;
import java.util.List;

/** Service contract for vendor. */
public interface VendorService {
    VendorDTO create(VendorDTO dto);

    VendorDTO update(Long id, VendorDTO dto);

    VendorDTO getById(Long id);

    List<VendorDTO> getAll(Long siteId, Boolean active);

    void delete(Long id);

    Vendor getEntity(Long id);

    Vendor getEntityWithAssignments(Long id);

    boolean isVendorAssignedToSite(Long vendorId, Long siteId);
}
