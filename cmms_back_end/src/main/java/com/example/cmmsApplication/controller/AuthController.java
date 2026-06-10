package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.LoginRequest;
import com.example.cmmsApplication.dto.LoginResponse;
import com.example.cmmsApplication.dto.ChangePasswordRequest;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import com.example.cmmsApplication.repository.UserRepository;
import com.example.cmmsApplication.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    
    public AuthController(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Login with username and password to get JWT token. Default password is 'andritz'")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful, JWT token returned"),
        @ApiResponse(responseCode = "401", description = "Invalid username or password"),
        @ApiResponse(responseCode = "400", description = "Invalid request body")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + loginRequest.getUsername()));
            
            // Verify password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid username or password", HttpStatus.UNAUTHORIZED.value()));
            }
            
            // Check if user is active
            if (!user.getActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User account is inactive", HttpStatus.UNAUTHORIZED.value()));
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());
            
            // Convert to DTO (excluding password)
            com.example.cmmsApplication.dto.UserDTO userDTO = new com.example.cmmsApplication.dto.UserDTO(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole(),
                    user.getDepartment(),
                    user.getManager() != null ? user.getManager().getId() : null,
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    user.getActive()
            );
            
            LoginResponse response = new LoginResponse(token, userDTO, "Login successful");
            return ResponseEntity.ok(response);
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid username or password", HttpStatus.UNAUTHORIZED.value()));
        }
    }
    
    @PostMapping("/change-password")
    @Operation(summary = "Change user password", description = "Change password for authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or passwords don't match"),
        @ApiResponse(responseCode = "401", description = "Current password is incorrect"),
        @ApiResponse(responseCode = "403", description = "Unauthorized - JWT token required")
    })
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            // Get username from security context
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            
            // Check if new password and confirm password match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("New password and confirm password do not match", HttpStatus.BAD_REQUEST.value()));
            }
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Current password is incorrect", HttpStatus.UNAUTHORIZED.value()));
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            return ResponseEntity.ok(new SuccessResponse("Password changed successfully"));
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }
    
    /**
     * Simple error response class
     */
    public static class ErrorResponse {
        private String message;
        private int status;
        
        public ErrorResponse(String message, int status) {
            this.message = message;
            this.status = status;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public int getStatus() {
            return status;
        }
        
        public void setStatus(int status) {
            this.status = status;
        }
    }
    
    /**
     * Simple success response class
     */
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
