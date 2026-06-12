package com.example.cmmsApplication.dao;

import com.example.cmmsApplication.entity.Vendor;
import com.example.cmmsApplication.repository.VendorRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class VendorDAO {
    private final VendorRepository repository;

    public VendorDAO(VendorRepository repository) {
        this.repository = repository;
    }

    public Vendor save(Vendor vendor) { return repository.save(vendor); }
    public Optional<Vendor> findById(Long id) { return repository.findById(id); }
    public Optional<Vendor> findWithSiteAssignmentsById(Long id) { return repository.findWithSiteAssignmentsById(id); }
    public List<Vendor> findAll() { return repository.findAll(); }
    public List<Vendor> findByActive(Boolean active) { return repository.findByActive(active); }
    public List<Vendor> findBySiteId(Long siteId) { return repository.findDistinctBySiteAssignmentsSiteIdAndSiteAssignmentsStatusIgnoreCase(siteId, "ACTIVE"); }
    public List<Vendor> findBySiteIdAndActive(Long siteId, Boolean active) { return repository.findDistinctBySiteAssignmentsSiteIdAndSiteAssignmentsStatusIgnoreCaseAndActive(siteId, "ACTIVE", active); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public long countActive() { return repository.countByActiveTrue(); }
    public boolean existsByVendorCode(String code) { return repository.existsByVendorCode(code); }
    public boolean existsByVendorCodeAndIdNot(String code, Long id) { return repository.existsByVendorCodeAndIdNot(code, id); }
}
