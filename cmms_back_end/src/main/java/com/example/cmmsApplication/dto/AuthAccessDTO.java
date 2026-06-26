package com.example.cmmsApplication.dto;

import java.util.ArrayList;
import java.util.List;

public class AuthAccessDTO {
    private UserDTO user;
    private List<String> roles = new ArrayList<>();
    private List<String> permissions = new ArrayList<>();
    private List<AllowedSiteDTO> allowedSites = new ArrayList<>();

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    public List<AllowedSiteDTO> getAllowedSites() { return allowedSites; }
    public void setAllowedSites(List<AllowedSiteDTO> allowedSites) { this.allowedSites = allowedSites; }
}
