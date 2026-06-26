package com.example.cmmsApplication.employee.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;


import com.example.cmmsApplication.employee.entity.Employee;
import com.example.cmmsApplication.employee.dto.EmployeeDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.employee.service.EmployeeService;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/employees")
public class EmployeeController {
    private final EmployeeService employeeService;
    private final ListSearchService listSearchService;

    public EmployeeController(EmployeeService employeeService, ListSearchService listSearchService) {
        this.employeeService = employeeService;
        this.listSearchService = listSearchService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody EmployeeDTO dto) {
        return ResponseFactory.created(employeeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        return ResponseFactory.ok(employeeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(employeeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseFactory.ok(employeeService.getAll());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchEmployees(searchDTO));
    }
}





