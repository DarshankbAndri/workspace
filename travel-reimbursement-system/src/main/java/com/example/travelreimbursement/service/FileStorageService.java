package com.example.travelreimbursement.service;

import com.example.travelreimbursement.config.FileStorageConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final FileStorageConfig fileStorageConfig;

    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.fileStorageConfig = fileStorageConfig;
    }

    /**
     * Store a file on disk and return its path
     *
     * @param file the file to store
     * @param claimId the claim ID for organizing files
     * @param sectionId the section ID for grouping documents
     * @return the relative file path stored in database
     * @throws IOException if file storage fails
     */
    public String storeFile(MultipartFile file, Long claimId, String sectionId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        // Create directory structure: basePath/claims/{claimId}/{sectionId}/
        String baseStoragePath = fileStorageConfig.getPath();
        Path claimDirectory = Paths.get(baseStoragePath, "claims", claimId.toString(), sectionId);

        // Create directories if they don't exist
        Files.createDirectories(claimDirectory);

        // Generate unique filename to avoid conflicts
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + (fileExtension.isEmpty() ? "" : "." + fileExtension);

        // Store the file
        Path filePath = claimDirectory.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        // Return relative path for database storage
        // Format: claims/{claimId}/{sectionId}/{uniqueFilename}
        return "claims/" + claimId + "/" + sectionId + "/" + uniqueFilename;
    }

    /**
     * Retrieve file content from disk
     *
     * @param relativePath the relative file path stored in database
     * @return the file content as bytes
     * @throws IOException if file retrieval fails
     */
    public byte[] retrieveFile(String relativePath) throws IOException {
        String baseStoragePath = fileStorageConfig.getPath();
        Path filePath = Paths.get(baseStoragePath, relativePath);

        // Security check: ensure path doesn't traverse outside base directory
        if (!filePath.normalize().toAbsolutePath().toString()
                .startsWith(Paths.get(baseStoragePath).normalize().toAbsolutePath().toString())) {
            throw new SecurityException("Invalid file path: " + relativePath);
        }

        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("File not found: " + relativePath);
        }

        return Files.readAllBytes(filePath);
    }

    /**
     * Delete a file from disk
     *
     * @param relativePath the relative file path stored in database
     * @throws IOException if file deletion fails
     */
    public void deleteFile(String relativePath) throws IOException {
        String baseStoragePath = fileStorageConfig.getPath();
        Path filePath = Paths.get(baseStoragePath, relativePath);

        // Security check: ensure path doesn't traverse outside base directory
        if (!filePath.normalize().toAbsolutePath().toString()
                .startsWith(Paths.get(baseStoragePath).normalize().toAbsolutePath().toString())) {
            throw new SecurityException("Invalid file path: " + relativePath);
        }

        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Get the full file path
     */
    public String getFullPath(String relativePath) {
        return Paths.get(fileStorageConfig.getPath(), relativePath).toString();
    }
}
