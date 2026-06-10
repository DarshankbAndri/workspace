package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dao.VendorDAO;
import com.example.cmmsApplication.dto.VendorDTO;
import com.example.cmmsApplication.entity.Vendor;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VendorService {
    private final VendorDAO vendorDAO;

    public VendorService(VendorDAO vendorDAO) {
        this.vendorDAO = vendorDAO;
    }

    public VendorDTO create(VendorDTO dto) {
        if (vendorDAO.existsByVendorCode(dto.getVendorCode())) {
            throw new InvalidOperationException("Vendor code already exists: " + dto.getVendorCode());
        }
        Vendor vendor = new Vendor();
        apply(vendor, dto);
        return toDTO(vendorDAO.save(vendor));
    }

    public VendorDTO update(Long id, VendorDTO dto) {
        Vendor vendor = getEntity(id);
        if (vendorDAO.existsByVendorCodeAndIdNot(dto.getVendorCode(), id)) {
            throw new InvalidOperationException("Vendor code already exists: " + dto.getVendorCode());
        }
        apply(vendor, dto);
        return toDTO(vendorDAO.save(vendor));
    }

    @Transactional(readOnly = true)
    public VendorDTO getById(Long id) {
        return toDTO(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<VendorDTO> getAll() {
        return vendorDAO.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public void delete(Long id) {
        getEntity(id);
        vendorDAO.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Vendor getEntity(Long id) {
        return vendorDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
    }

    private void apply(Vendor vendor, VendorDTO dto) {
        vendor.setVendorCode(dto.getVendorCode());
        vendor.setVendorName(dto.getVendorName());
        vendor.setContactPerson(dto.getContactPerson());
        vendor.setEmail(dto.getEmail());
        vendor.setPhone(dto.getPhone());
        vendor.setAddress(dto.getAddress());
        vendor.setServiceCategory(dto.getServiceCategory());
        vendor.setActive(dto.getActive() == null || dto.getActive());
    }

    private VendorDTO toDTO(Vendor vendor) {
        VendorDTO dto = new VendorDTO();
        dto.setId(vendor.getId());
        dto.setVendorCode(vendor.getVendorCode());
        dto.setVendorName(vendor.getVendorName());
        dto.setContactPerson(vendor.getContactPerson());
        dto.setEmail(vendor.getEmail());
        dto.setPhone(vendor.getPhone());
        dto.setAddress(vendor.getAddress());
        dto.setServiceCategory(vendor.getServiceCategory());
        dto.setActive(vendor.getActive());
        dto.setCreatedAt(vendor.getCreatedAt());
        dto.setUpdatedAt(vendor.getUpdatedAt());
        return dto;
    }
}
