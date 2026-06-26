package com.example.cmmsApplication.common.security.controller;

import com.example.cmmsApplication.common.security.dto.LoginRequest;
import com.example.cmmsApplication.common.security.dto.LoginResponse;
import com.example.cmmsApplication.common.security.dto.ChangePasswordRequest;
import com.example.cmmsApplication.common.security.dto.AuthAccessDTO;
import com.example.cmmsApplication.common.observability.ObservabilityMetrics;
import com.example.cmmsApplication.common.response.ApiErrorCode;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.common.exception.ResourceNotFoundException;
import com.example.cmmsApplication.user.repository.UserRepository;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import com.example.cmmsApplication.common.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Validated
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AccessControlService accessControlService;
    private final ObservabilityMetrics observabilityMetrics;
    
    public AuthController(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder,
                          AccessControlService accessControlService, ObservabilityMetrics observabilityMetrics) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.accessControlService = accessControlService;
        this.observabilityMetrics = observabilityMetrics;
    }
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Login with username and password to get JWT token. Default password is 'andritz'")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful, JWT token returned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid username or password"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + loginRequest.getUsername()));
            
            // Verify password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                observabilityMetrics.recordLoginFailure("bad_credentials", "/auth/login");
                return ResponseFactory.error(HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED,
                        "Invalid username or password");
            }
            
            // Check if user is active
            if (!user.getActive()) {
                observabilityMetrics.recordLoginFailure("disabled_account", "/auth/login");
                return ResponseFactory.error(HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED,
                        "User account is inactive");
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());
            
            AuthAccessDTO access = accessControlService.buildAccessPayload(user);
            LoginResponse response = new LoginResponse(token, access.getUser(), "Login successful");
            response.setRoles(access.getRoles());
            response.setPermissions(access.getPermissions());
            response.setAllowedSites(access.getAllowedSites());
            return ResponseFactory.ok(response, "Login successful");
            
        } catch (ResourceNotFoundException e) {
            observabilityMetrics.recordLoginFailure("bad_credentials", "/auth/login");
            return ResponseFactory.error(HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED,
                    "Invalid username or password");
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Current user access", description = "Returns current user, roles, permissions and allowed sites")
    public ResponseEntity<com.example.cmmsApplication.common.response.ApiResponse<?>> me() {
        User user = accessControlService.getCurrentUser();
        return ResponseFactory.ok(accessControlService.buildAccessPayload(user));
    }
    
    @PostMapping("/change-password")
    @Operation(summary = "Change user password", description = "Change password for authenticated user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or passwords don't match"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Current password is incorrect"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Unauthorized - JWT token required")
    })
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            // Get username from security context
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            
            // Check if new password and confirm password match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseFactory.error(HttpStatus.BAD_REQUEST, ApiErrorCode.BAD_REQUEST,
                        "New password and confirm password do not match");
            }
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseFactory.error(HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED,
                        "Current password is incorrect");
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            return ResponseFactory.ok(null, "Password changed successfully");
            
        } catch (ResourceNotFoundException e) {
            return ResponseFactory.error(HttpStatus.NOT_FOUND, ApiErrorCode.RESOURCE_NOT_FOUND, e.getMessage());
        }
    }
}




