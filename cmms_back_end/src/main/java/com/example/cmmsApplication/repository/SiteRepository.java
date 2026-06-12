package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    boolean existsBySiteCode(String siteCode);
    boolean existsBySiteCodeAndIdNot(String siteCode, Long id);
}
