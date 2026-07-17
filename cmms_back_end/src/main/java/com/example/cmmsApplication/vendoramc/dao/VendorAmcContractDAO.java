package com.example.cmmsApplication.vendoramc.dao;

import com.example.cmmsApplication.vendoramc.entity.VendorAmcContract;
import com.example.cmmsApplication.vendoramc.repository.VendorAmcContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class VendorAmcContractDAO {
    private final VendorAmcContractRepository repository;

    public VendorAmcContract save(VendorAmcContract contract) { return repository.save(contract); }
    public Optional<VendorAmcContract> findById(Long id) { return repository.findById(id); }
    public List<VendorAmcContract> findAll() { return repository.findAll(); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public boolean existsByContractNumber(String number) { return repository.existsByContractNumber(number); }
    public boolean existsByContractNumberAndIdNot(String number, Long id) { return repository.existsByContractNumberAndIdNot(number, id); }
    public List<VendorAmcContract> findByVendorId(Long vendorId) { return repository.findByVendorIdOrderByEndDateDesc(vendorId); }
    public long countByStatus(String status) { return repository.countByStatus(status); }
    public List<VendorAmcContract> findExpiring(LocalDate today, LocalDate warningDate) { return repository.findExpiring(today, warningDate); }
    public List<VendorAmcContract> findExpired(LocalDate today) { return repository.findExpired(today); }
    public long countCoveredEquipment(Collection<String> statuses) { return repository.countCoveredEquipment(statuses); }
}
