package com.example.cmmsApplication.user.service;

import com.example.cmmsApplication.common.config.FileStorageConfig;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.user.dto.UserProfileDTO;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.user.repository.UserRepository;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileService {
    private final AccessControlService accessControlService;
    private final UserRepository userRepository;
    private final FileStorageConfig fileStorageConfig;

    @Transactional(readOnly = true)
    public UserProfileDTO getCurrentProfile() {
        return toDTO(accessControlService.getCurrentUser());
    }

    public UserProfileDTO uploadProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Profile photo is required");
        }
        validatePhoto(file);
        User user = accessControlService.getCurrentUser();
        Path oldPhoto = user.getProfilePhotoPath() == null ? null : Path.of(user.getProfilePhotoPath()).toAbsolutePath().normalize();
        Path target = storePhoto(user.getId(), file);
        user.setProfilePhotoPath(target.toString());
        User saved = userRepository.save(user);
        deleteOldPhoto(oldPhoto, target);
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public Resource getProfilePhoto(String fileName) {
        try {
            Path photoPath = profilePhotoDirectory().resolve(fileName).normalize();
            if (!photoPath.startsWith(profilePhotoDirectory())) {
                throw new ResourceNotFoundException("Profile photo not found");
            }
            Resource resource = new UrlResource(photoPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Profile photo not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Profile photo not found", ex);
        }
    }

    private Path storePhoto(Long userId, MultipartFile file) {
        try {
            Files.createDirectories(profilePhotoDirectory());
            String storedName = "user-" + userId + "-" + UUID.randomUUID() + extension(file.getOriginalFilename());
            Path target = profilePhotoDirectory().resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException ex) {
            throw new InvalidOperationException("Unable to store profile photo");
        }
    }

    private void validatePhoto(MultipartFile file) {
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/")) {
            throw new InvalidOperationException("Profile photo must be an image file");
        }
        if (file.getSize() > 5L * 1024L * 1024L) {
            throw new InvalidOperationException("Profile photo must be 5 MB or smaller");
        }
    }

    private Path profilePhotoDirectory() {
        return Path.of(fileStorageConfig.getPath()).resolve("user-profile-photos").toAbsolutePath().normalize();
    }

    private String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".bin";
        }
        String ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        return ext.matches("\\.(png|jpg|jpeg|gif|webp)") ? ext : ".bin";
    }

    private void deleteOldPhoto(Path oldPhoto, Path newPhoto) {
        if (oldPhoto == null || oldPhoto.equals(newPhoto) || !oldPhoto.startsWith(profilePhotoDirectory())) {
            return;
        }
        try {
            Files.deleteIfExists(oldPhoto);
        } catch (IOException ignored) {
            // Old avatar cleanup is best-effort; the new upload has already succeeded.
        }
    }

    private UserProfileDTO toDTO(User user) {
        Employee employee = user.getEmployee();
        return UserProfileDTO.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .active(user.getActive())
                .profilePhotoUrl(profilePhotoUrl(user))
                .employeeId(employee == null ? null : employee.getId())
                .employeeCode(employee == null ? null : employee.getEmployeeCode())
                .employeeName(employee == null ? null : userName(employee.getFirstName(), employee.getLastName()))
                .mobileNumber(employee == null ? null : employee.getMobileNumber())
                .gender(employee == null ? null : employee.getGender())
                .dateOfBirth(employee == null ? null : employee.getDateOfBirth())
                .dateOfJoining(employee == null ? null : employee.getDateOfJoining())
                .designation(employee == null ? null : employee.getDesignation())
                .employeeDepartment(employee == null ? null : employee.getDepartment())
                .employeeStatus(employee == null ? null : employee.getStatus())
                .build();
    }

    private String profilePhotoUrl(User user) {
        if (user.getProfilePhotoPath() == null || user.getProfilePhotoPath().isBlank()) {
            return null;
        }
        return "/auth/profile/avatar/" + Path.of(user.getProfilePhotoPath()).getFileName();
    }

    private String userName(String firstName, String lastName) {
        return ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
    }
}
