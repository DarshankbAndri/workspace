package com.example.cmmsApplication.common.security.repository;

import com.example.cmmsApplication.common.security.entity.PermissionApiMapping;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionApiMappingRepository extends JpaRepository<PermissionApiMapping, Long>, PermissionApiMappingRepositoryCustom {
    Optional<PermissionApiMapping> findByPermissionCodeAndApiPathAndHttpMethod(String permissionCode, String apiPath, String httpMethod);

    @Query(value = "select count(1) from user_role ur " +
                   "join role_permission rp on rp.role_id=ur.role_id " +
                   "join permission_master pm on pm.permission_id=rp.permission_id " +
                   "join permission_api_mapping pam on pam.permission_code=pm.permission_code " +
                   "where ur.user_id=:userId and pam.api_path=:apiPath", nativeQuery = true)
    int countUserPermissionsForApiPath(@Param("userId") Long userId, @Param("apiPath") String apiPath);

}
