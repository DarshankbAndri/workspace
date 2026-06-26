package com.example.cmmsApplication.site.dao;

import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.site.repository.SiteRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class SiteDAO {
    private final SiteRepository repository;

    public SiteDAO(SiteRepository repository) {
        this.repository = repository;
    }

    public Site save(Site site) { return repository.save(site); }
    public Optional<Site> findById(Long id) { return repository.findById(id); }
    public List<Site> findAll() { return repository.findAll(); }
    public void deleteById(Long id) { repository.deleteById(id); }
    public boolean existsBySiteCode(String code) { return repository.existsBySiteCode(code); }
    public boolean existsBySiteCodeAndIdNot(String code, Long id) { return repository.existsBySiteCodeAndIdNot(code, id); }
}
