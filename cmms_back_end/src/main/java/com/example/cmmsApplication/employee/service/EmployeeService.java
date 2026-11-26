package com.example.cmmsApplication.employee.service;

import com.example.cmmsApplication.employee.dto.EmployeeDTO;
import java.util.List;

/** Service contract for employee. */
public interface EmployeeService {
    EmployeeDTO create(EmployeeDTO dto);

    EmployeeDTO update(Long id, EmployeeDTO dto);

    EmployeeDTO getById(Long id);

    List<EmployeeDTO> getAll();

    void delete(Long id);
}
