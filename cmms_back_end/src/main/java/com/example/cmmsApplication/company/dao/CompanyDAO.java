package com.example.cmmsApplication.company.dao;

import com.example.cmmsApplication.company.entity.Company;
import com.example.cmmsApplication.company.repository.CompanyRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class CompanyDAO {
    private final CompanyRepository repository;

    public CompanyDAO(CompanyRepository repository) {
        this.repository = repository;
    }

    public Company save(Company company) { return repository.save(company); }
    public Optional<Company> findById(Long id) { return repository.findById(id); }
    public List<Company> findAll() { return repository.findAll(); }
    public boolean existsByCompanyCode(String companyCode) { return repository.existsByCompanyCode(companyCode); }
    public boolean existsByCompanyCodeAndIdNot(String companyCode, Long id) { return repository.existsByCompanyCodeAndIdNot(companyCode, id); }
    public Optional<Company> findCurrent() {
        return repository.findFirstByStatusIgnoreCaseOrderByUpdatedDateDescIdDesc("ACTIVE")
                .or(repository::findFirstByOrderByUpdatedDateDescIdDesc);
    }
}
