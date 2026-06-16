package com.example.cmmsApplication.repository;

import com.example.cmmsApplication.entity.SiteList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteListRepository extends JpaRepository<SiteList, Long>, JpaSpecificationExecutor<SiteList> {
}
