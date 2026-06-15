package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.MaintenanceRequest;
import com.example.cmmsApplication.repository.MaintenanceRequestRepository;
import org.springframework.stereotype.Component;
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
    public void deleteById(Long id) { repository.deleteById(id); }
    public long countOpenRequests() { return repository.countByStatusIn(Arrays.asList("OPEN", "IN_PROGRESS", "ON_HOLD")); }
    public long countOpenRequestsBySiteId(Long siteId) { return repository.countBySiteIdAndStatusIn(siteId, Arrays.asList("OPEN", "IN_PROGRESS", "ON_HOLD")); }
    public long countByPmScheduleId(Long pmScheduleId) { return repository.countByPmScheduleId(pmScheduleId); }
    public long countCompletedByPmScheduleId(Long pmScheduleId) { return repository.countByPmScheduleIdAndStatusIn(pmScheduleId, Arrays.asList("COMPLETED", "CLOSED")); }
    public boolean existsByRequestNumber(String requestNumber) { return repository.existsByRequestNumber(requestNumber); }
    public boolean existsByRequestNumberAndIdNot(String requestNumber, Long id) { return repository.existsByRequestNumberAndIdNot(requestNumber, id); }
}
