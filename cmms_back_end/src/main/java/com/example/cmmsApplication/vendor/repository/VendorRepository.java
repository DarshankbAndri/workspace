package com.example.cmmsApplication.vendor.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    boolean existsByVendorCode(String vendorCode);
    boolean existsByVendorCodeAndIdNot(String vendorCode, Long id);
    long countByActiveTrue();
    List<Vendor> findByActive(Boolean active);

    @EntityGraph(attributePaths = {"siteAssignments", "siteAssignments.site"})
    Optional<Vendor> findWithSiteAssignmentsById(Long id);

    @EntityGraph(attributePaths = {"siteAssignments", "siteAssignments.site"})
    List<Vendor> findDistinctBySiteAssignmentsSiteIdAndSiteAssignmentsStatusIgnoreCase(Long siteId, String status);

    @EntityGraph(attributePaths = {"siteAssignments", "siteAssignments.site"})
    List<Vendor> findDistinctBySiteAssignmentsSiteIdInAndSiteAssignmentsStatusIgnoreCase(Collection<Long> siteIds, String status);

    @EntityGraph(attributePaths = {"siteAssignments", "siteAssignments.site"})
    List<Vendor> findDistinctBySiteAssignmentsSiteIdAndSiteAssignmentsStatusIgnoreCaseAndActive(Long siteId, String status, Boolean active);

    @EntityGraph(attributePaths = {"siteAssignments", "siteAssignments.site"})
    List<Vendor> findDistinctBySiteAssignmentsSiteIdInAndSiteAssignmentsStatusIgnoreCaseAndActive(Collection<Long> siteIds, String status, Boolean active);
}
