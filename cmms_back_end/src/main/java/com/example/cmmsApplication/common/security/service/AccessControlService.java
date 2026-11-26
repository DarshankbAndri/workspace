package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.common.security.dto.AllowedSiteDTO;
import com.example.cmmsApplication.common.security.dto.AuthAccessDTO;
import com.example.cmmsApplication.user.entity.User;
import java.util.Collection;
import java.util.List;
import java.util.Set;

/** Service contract for access control. */
public interface AccessControlService {
    User getCurrentUser();

    Long getCurrentUserId();

    Long getCurrentEmployeeId();

    List<Long> getAllowedSiteIds();

    List<AllowedSiteDTO> getAllowedSites();

    boolean hasPermission(String permissionCode);

    boolean hasAnyPermission(Collection<String> permissionCodes);

    void validatePermission(String permissionCode);

    void validateSiteAccess(Long siteId);

    void validateAnySiteAccess(Collection<Long> siteIds);

    boolean isSuperAdmin();

    boolean isAdmin();

    boolean hasAllSiteAccess();

    Set<String> getRoles();

    Set<String> getPermissions();

    AuthAccessDTO buildAccessPayload(User user);
}
