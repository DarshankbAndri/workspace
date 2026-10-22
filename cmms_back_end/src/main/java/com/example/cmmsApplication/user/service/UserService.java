package com.example.cmmsApplication.user.service;

import com.example.cmmsApplication.user.dto.UserDTO;
import com.example.cmmsApplication.employee.dto.EmployeeDTO;
import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.user.entity.User;
import java.util.List;

/** Service contract for user. */
public interface UserService {
    List<UserDTO> getAllUsers();

    UserDTO getUserById(Long userId);

    UserDTO getUserByUsername(String username);

    UserDTO createUserByHR(Long hrId, UserDTO userDTO);

    UserDTO createUser(UserDTO userDTO);

    UserDTO updateUser(Long userId, UserDTO userDTO);

    User syncEmployeeLogin(Employee employee, EmployeeDTO employeeDTO);

    User getLoginUserByEmployeeId(Long employeeId);
}
