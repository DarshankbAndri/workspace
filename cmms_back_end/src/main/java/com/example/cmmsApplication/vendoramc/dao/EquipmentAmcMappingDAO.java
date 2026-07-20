package com.example.cmmsApplication.vendoramc.dao;

import com.example.cmmsApplication.vendoramc.entity.EquipmentAmcMapping;
import com.example.cmmsApplication.vendoramc.repository.EquipmentAmcMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EquipmentAmcMappingDAO {
    private final EquipmentAmcMappingRepository repository;

    public EquipmentAmcMapping save(EquipmentAmcMapping mapping) { return repository.save(mapping); }
    public List<EquipmentAmcMapping> findAll() { return repository.findAll(); }
    public Optional<EquipmentAmcMapping> findByContractAndEquipment(Long contractId, Long equipmentId) { return repository.findByAmcContractIdAndEquipmentId(contractId, equipmentId); }
    public List<EquipmentAmcMapping> findByContractId(Long contractId) { return repository.findByAmcContractIdOrderByEquipmentEquipmentNameAsc(contractId); }
    public List<EquipmentAmcMapping> findByEquipmentId(Long equipmentId) { return repository.findByEquipmentIdOrderByCoverageEndDateDescIdDesc(equipmentId); }
    public long countByContractId(Long contractId) { return repository.countByAmcContractId(contractId); }
    public void deleteByContractId(Long contractId) { repository.deleteByAmcContractId(contractId); }
    public boolean existsByContractAndEquipment(Long contractId, Long equipmentId) { return repository.existsByAmcContractIdAndEquipmentId(contractId, equipmentId); }
    public List<EquipmentAmcMapping> findActiveByEquipment(Long equipmentId, LocalDate date, Collection<String> statuses) { return repository.findActiveByEquipment(equipmentId, date, statuses); }
    public long countOverlappingActive(Long equipmentId, Long contractId, LocalDate start, LocalDate end, Collection<String> statuses) { return repository.countOverlappingActive(equipmentId, contractId, start, end, statuses); }
}
