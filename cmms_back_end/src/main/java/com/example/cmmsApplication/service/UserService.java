package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dto.UserDTO;
import com.example.cmmsApplication.entity.User;
import com.example.cmmsApplication.entity.UserRole;
import com.example.cmmsApplication.exception.ResourceNotFoundException;
import com.example.cmmsApplication.exception.InvalidOperationException;
import com.example.cmmsApplication.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final String DEFAULT_PASSWORD = "andritz";
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return convertToDTO(user);
    }
    
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return convertToDTO(user);
    }
    
    public UserDTO createUserByHR(Long hrId, UserDTO userDTO) {
        // Verify HR user exists and has HR role
        User hrUser = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with id: " + hrId));
        
        if (!hrUser.getRole().equals(UserRole.HR)) {
            throw new InvalidOperationException("Only HR users can create new users. User " + hrId + " does not have HR role");
        }
        
        // Check for duplicate username
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userDTO.getUsername());
        }
        
        // Check for duplicate email
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userDTO.getEmail());
        }
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setRole(userDTO.getRole());
        user.setDepartment(userDTO.getDepartment());
        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setActive(true);
        
        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findById(userDTO.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            user.setManager(manager);
        }
        
        User createdUser = userRepository.save(user);
        return convertToDTO(createdUser);
    }
    
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userDTO.getUsername());
        }
        
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userDTO.getEmail());
        }
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setRole(userDTO.getRole());
        user.setDepartment(userDTO.getDepartment());
        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setActive(true);
        
        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findById(userDTO.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            user.setManager(manager);
        }
        
        User createdUser = userRepository.save(user);
        return convertToDTO(createdUser);
    }
    
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setDepartment(userDTO.getDepartment());
        user.setActive(userDTO.getActive());
        
        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findById(userDTO.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            user.setManager(manager);
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
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
    }
}
