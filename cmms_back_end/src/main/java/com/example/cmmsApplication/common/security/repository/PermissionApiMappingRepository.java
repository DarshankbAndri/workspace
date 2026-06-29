package com.example.cmmsApplication.common.security.repository;

import com.example.cmmsApplication.common.security.entity.PermissionApiMapping;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionApiMappingRepository extends JpaRepository<PermissionApiMapping, Long>, PermissionApiMappingRepositoryCustom {
    Optional<PermissionApiMapping> findByPermissionCodeAndApiPathAndHttpMethod(String permissionCode, String apiPath, String httpMethod);
}
