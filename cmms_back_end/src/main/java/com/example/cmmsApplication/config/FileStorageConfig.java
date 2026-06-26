package com.example.cmmsApplication.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "file.storage")
public class FileStorageConfig {

    /**
     * Base directory for storing uploaded files.
     * Can be set via environment variable FILE_STORAGE_PATH or property file
     */
    private String path;

    public String getPath() {
        return path != null ? path : System.getProperty("user.home") + "/travel-reimbursement/documents";
    }

    public void setPath(String path) {
        this.path = path;
    }
}
