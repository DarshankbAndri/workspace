package com.example.cmmsApplication.user.service;

import com.example.cmmsApplication.user.dto.UserProfileDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/** Service contract for user profile. */
public interface UserProfileService {
    UserProfileDTO getCurrentProfile();

    UserProfileDTO uploadProfilePhoto(MultipartFile file);

    Resource getProfilePhoto(String fileName);
}
