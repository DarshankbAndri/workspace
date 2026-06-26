package com.example.cmmsApplication.admin.service;


import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.admin.dao.UserRoleAssignmentDAO;
import com.example.cmmsApplication.admin.dto.UserRoleAssignmentDTO;
import com.example.cmmsApplication.admin.entity.RoleMaster;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.admin.entity.UserRoleAssignment;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.site.repository.SiteRepository;
import com.example.cmmsApplication.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserRoleAssignmentService {
    private final UserRoleAssignmentDAO userRoleAssignmentDAO;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final RoleService roleService;
    private final AccessControlService accessControlService;

    public UserRoleAssignmentService(UserRoleAssignmentDAO userRoleAssignmentDAO, UserRepository userRepository, SiteRepository siteRepository, RoleService roleService, AccessControlService accessControlService) {
        this.userRoleAssignmentDAO = userRoleAssignmentDAO;
        this.userRepository = userRepository;
        this.siteRepository = siteRepository;
        this.roleService = roleService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<UserRoleAssignmentDTO> getByUserId(Long userId) {
        accessControlService.validatePermission("USER_ROLE_VIEW");
        return userRoleAssignmentDAO.findActiveByUserId(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<UserRoleAssignmentDTO> replaceUserRoles(Long userId, List<UserRoleAssignmentDTO> assignments) {
        accessControlService.validatePermission("USER_ROLE_UPDATE");
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRoleAssignmentDAO.deleteByUserId(userId);
        if (assignments != null) {
            for (UserRoleAssignmentDTO dto : assignments) {
                RoleMaster role = roleService.getEntity(dto.getRoleId());
                Site site = dto.getSiteId() == null ? null : siteRepository.findById(dto.getSiteId())
                        .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + dto.getSiteId()));
                UserRoleAssignment assignment = new UserRoleAssignment();
                assignment.setUser(user);
                assignment.setRole(role);
                assignment.setSite(site);
                assignment.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "ACTIVE" : dto.getStatus());
                userRoleAssignmentDAO.save(assignment);
            }
        }
        return getByUserId(userId);
    }

    private UserRoleAssignmentDTO toDTO(UserRoleAssignment assignment) {
        UserRoleAssignmentDTO dto = new UserRoleAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setUserId(assignment.getUser().getId());
        dto.setUsername(assignment.getUser().getUsername());
        dto.setRoleId(assignment.getRole().getId());
        dto.setRoleCode(assignment.getRole().getRoleCode());
        dto.setSiteId(assignment.getSite() == null ? null : assignment.getSite().getId());
        dto.setSiteName(assignment.getSite() == null ? null : assignment.getSite().getSiteName());
        dto.setStatus(assignment.getStatus());
        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setUpdatedAt(assignment.getUpdatedAt());
        return dto;
    }
}





