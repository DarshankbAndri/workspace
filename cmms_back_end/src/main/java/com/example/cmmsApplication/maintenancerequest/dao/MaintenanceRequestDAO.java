package com.example.cmmsApplication.maintenancerequest.dao;

import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.maintenancerequest.repository.MaintenanceRequestRepository;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class MaintenanceRequestDAO {
    private final MaintenanceRequestRepository repository;

    public MaintenanceRequestDAO(MaintenanceRequestRepository repository) {
        this.repository = repository;
    }

    public MaintenanceRequest save(MaintenanceRequest request) { return repository.save(request); }
    public Optional<MaintenanceRequest> findById(Long id) { return repository.findById(id); }
    public List<MaintenanceRequest> findAll() { return repository.findAll(); }
    public List<MaintenanceRequest> findBySiteId(Long siteId) { return repository.findBySiteId(siteId); }
    public List<MaintenanceRequest> findBySiteIds(Collection<Long> siteIds) { return repository.findBySiteIdIn(siteIds); }
    public List<MaintenanceRequest> findByStatus(String status) { return repository.findByStatus(status); }
    public List<MaintenanceRequest> findBySiteIdsAndStatus(Collection<Long> siteIds, String status) { return repository.findBySiteIdInAndStatus(siteIds, status); }
    public List<MaintenanceRequest> findBySiteIdAndStatus(Long siteId, String status) { return repository.findBySiteIdAndStatus(siteId, status); }
    public List<MaintenanceRequest> findOverdue(LocalDate date) { return repository.findByTargetCompletionDateBeforeAndStatusNotInOrderByTargetCompletionDateAsc(date, Arrays.asList("CLOSED", "COMPLETED", "CANCELLED", "REJECTED")); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public long countAll() { return repository.count(); }
    public long countByStatus(String status) { return repository.countByStatus(status); }
    public long countBySiteIds(Collection<Long> siteIds) { return repository.countBySiteIdIn(siteIds); }
    public long countBySiteIdsAndStatus(Collection<Long> siteIds, String status) { return repository.countBySiteIdInAndStatus(siteIds, status); }
    public long countOpenRequests() { return repository.countByStatusIn(Arrays.asList("OPEN", "IN_PROGRESS", "ON_HOLD")); }
    public long countOpenRequestsBySiteId(Long siteId) { return repository.countBySiteIdAndStatusIn(siteId, Arrays.asList("OPEN", "IN_PROGRESS", "ON_HOLD")); }
    public long countOpenRequestsByEquipmentId(Long equipmentId) { return repository.countByEquipmentIdAndStatusNotIn(equipmentId, Arrays.asList("CLOSED", "COMPLETED", "CANCELLED", "REJECTED")); }
    public Optional<MaintenanceRequest> findLatestOpenByEquipmentId(Long equipmentId) { return repository.findTopByEquipmentIdAndStatusNotInOrderByRequestedDateDescIdDesc(equipmentId, Arrays.asList("CLOSED", "COMPLETED", "CANCELLED", "REJECTED")); }
    public long countCritical(Collection<Long> siteIds, boolean allSites) {
        List<String> priorities = Arrays.asList("CRITICAL", "URGENT", "HIGH");
        List<String> closed = Arrays.asList("CLOSED", "COMPLETED", "CANCELLED", "REJECTED");
        return allSites ? repository.countByPriorityInAndStatusNotIn(priorities, closed) : repository.countBySiteIdInAndPriorityInAndStatusNotIn(siteIds, priorities, closed);
    }
    public long countOverdue(Collection<Long> siteIds, boolean allSites, LocalDate date) {
        List<String> closed = Arrays.asList("CLOSED", "COMPLETED", "CANCELLED", "REJECTED");
        return allSites ? repository.countByTargetCompletionDateBeforeAndStatusNotIn(date, closed) : repository.countBySiteIdInAndTargetCompletionDateBeforeAndStatusNotIn(siteIds, date, closed);
    }
    public long countUnassigned(Collection<Long> siteIds, boolean allSites) {
        return allSites ? repository.countUnassignedOpenRequests() : repository.countUnassignedOpenRequestsBySiteIds(siteIds);
    }
    public long countByPmScheduleId(Long pmScheduleId) { return repository.countByPmScheduleId(pmScheduleId); }
    public long countCompletedByPmScheduleId(Long pmScheduleId) { return repository.countByPmScheduleIdAndStatusIn(pmScheduleId, Arrays.asList("COMPLETED", "CLOSED")); }
    public long countByAmcContractId(Long amcContractId) { return repository.countByAmcContractId(amcContractId); }
    public boolean existsByRequestNumber(String requestNumber) { return repository.existsByRequestNumber(requestNumber); }
    public boolean existsByRequestNumberAndIdNot(String requestNumber, Long id) { return repository.existsByRequestNumberAndIdNot(requestNumber, id); }
}
