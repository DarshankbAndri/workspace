package com.example.cmmsApplication.controller;

import com.example.cmmsApplication.dto.EmployeeDTO;
import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.service.EmployeeService;
import com.example.cmmsApplication.service.ListSearchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<EmployeeDTO> create(@Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> update(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(employeeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<EmployeeDTO>> getAll() {
        return ResponseEntity.ok(employeeService.getAll());
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchEmployees(searchDTO));
    }
}
