package com.example.cmmsApplication.site.repository;


import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.site.entity.SiteList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteListRepository extends JpaRepository<SiteList, Long>, JpaSpecificationExecutor<SiteList> {
}
