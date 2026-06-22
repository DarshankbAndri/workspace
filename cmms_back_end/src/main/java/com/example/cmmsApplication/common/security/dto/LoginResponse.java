package com.example.cmmsApplication.common.security.dto;


import com.example.cmmsApplication.user.dto.UserDTO;
import com.example.cmmsApplication.user.entity.User;
public class LoginResponse {
    private String token;
    private UserDTO user;
    private String message;
    private java.util.List<String> roles = new java.util.ArrayList<>();
    private java.util.List<String> permissions = new java.util.ArrayList<>();
    private java.util.List<AllowedSiteDTO> allowedSites = new java.util.ArrayList<>();

    public LoginResponse(String token, UserDTO user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public java.util.List<String> getRoles() {
        return roles;
    }

    public void setRoles(java.util.List<String> roles) {
        this.roles = roles;
    }

    public java.util.List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(java.util.List<String> permissions) {
        this.permissions = permissions;
    }

    public java.util.List<AllowedSiteDTO> getAllowedSites() {
        return allowedSites;
    }

    public void setAllowedSites(java.util.List<AllowedSiteDTO> allowedSites) {
        this.allowedSites = allowedSites;
    }
}





