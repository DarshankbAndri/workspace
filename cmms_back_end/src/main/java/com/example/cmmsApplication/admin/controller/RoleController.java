package com.example.cmmsApplication.admin.controller;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.admin.dto.RoleDTO;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import com.example.cmmsApplication.admin.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/roles")
public class RoleController {
    private final RoleService roleService;
    private final ListSearchService listSearchService;

    public RoleController(RoleService roleService, ListSearchService listSearchService) {
        this.roleService = roleService;
        this.listSearchService = listSearchService;
    }

    @GetMapping
    public List<RoleDTO> getAll() {
        return roleService.getAll();
    }

    @PostMapping("/search")
    public ResponseEntity<PageProperties> search(@RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(listSearchService.searchRoles(searchDTO));
    }

    @GetMapping("/{id}")
    public RoleDTO getById(@PathVariable Long id) {
        return roleService.getById(id);
    }

    @PostMapping
    public RoleDTO create(@RequestBody RoleDTO dto) {
        return roleService.create(dto);
    }

    @PutMapping("/{id}")
    public RoleDTO update(@PathVariable Long id, @RequestBody RoleDTO dto) {
        return roleService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}




