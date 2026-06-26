package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    boolean existsBySiteCode(String siteCode);
    boolean existsBySiteCodeAndIdNot(String siteCode, Long id);
    List<Site> findByIdIn(Collection<Long> ids);
}
