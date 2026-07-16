package com.example.cmmsApplication.downtime.controller;

import com.example.cmmsApplication.common.response.ApiResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;

import com.example.cmmsApplication.downtime.dto.EquipmentDowntimeDTO;
import com.example.cmmsApplication.downtime.dto.DowntimeRcaActionDTO;
import com.example.cmmsApplication.downtime.dto.DowntimeTransitionDTO;
import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;
import com.example.cmmsApplication.downtime.service.EquipmentDowntimeService;
import com.example.cmmsApplication.common.search.service.ListSearchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/maintenance/downtime")
public class EquipmentDowntimeController {
    private final EquipmentDowntimeService downtimeService;
    private final ListSearchService listSearchService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody EquipmentDowntimeDTO dto) {
        return ResponseFactory.created(downtimeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody EquipmentDowntimeDTO dto) {
        return ResponseFactory.ok(downtimeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        downtimeService.delete(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseFactory.ok(downtimeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long siteId,
                                                             @RequestParam(required = false) Long equipmentId) {
        return ResponseFactory.ok(downtimeService.getAll(siteId, equipmentId));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestBody SearchDTO searchDTO) {
        return ResponseFactory.ok(listSearchService.searchDowntime(searchDTO));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<?>> confirm(@PathVariable Long id, @RequestBody(required = false) DowntimeTransitionDTO dto) {
        return ResponseFactory.ok(downtimeService.confirm(id, dto));
    }

    @PostMapping("/{id}/start-maintenance")
    public ResponseEntity<ApiResponse<?>> startMaintenance(@PathVariable Long id, @RequestBody(required = false) DowntimeTransitionDTO dto) {
        return ResponseFactory.ok(downtimeService.startMaintenance(id, dto));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<?>> restore(@PathVariable Long id, @RequestBody(required = false) DowntimeTransitionDTO dto) {
        return ResponseFactory.ok(downtimeService.restore(id, dto));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<?>> verify(@PathVariable Long id, @RequestBody(required = false) DowntimeTransitionDTO dto) {
        return ResponseFactory.ok(downtimeService.verify(id, dto));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<?>> close(@PathVariable Long id, @RequestBody(required = false) DowntimeTransitionDTO dto) {
        return ResponseFactory.ok(downtimeService.close(id, dto));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<?>> reopen(@PathVariable Long id, @RequestBody(required = false) DowntimeTransitionDTO dto) {
        return ResponseFactory.ok(downtimeService.reopen(id, dto));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<?>> getTimeline(@PathVariable Long id) {
        return ResponseFactory.ok(downtimeService.getTimeline(id));
    }

    @GetMapping("/{id}/rca-actions")
    public ResponseEntity<ApiResponse<?>> getRcaActions(@PathVariable Long id) {
        return ResponseFactory.ok(downtimeService.getRcaActions(id));
    }

    @PostMapping("/{id}/rca-actions")
    public ResponseEntity<ApiResponse<?>> addRcaAction(@PathVariable Long id, @Valid @RequestBody DowntimeRcaActionDTO dto) {
        return ResponseFactory.created(downtimeService.addRcaAction(id, dto));
    }

    @PutMapping("/{id}/rca-actions/{actionId}")
    public ResponseEntity<ApiResponse<?>> updateRcaAction(@PathVariable Long id,
                                                          @PathVariable Long actionId,
                                                          @Valid @RequestBody DowntimeRcaActionDTO dto) {
        return ResponseFactory.ok(downtimeService.updateRcaAction(id, actionId, dto));
    }
}
