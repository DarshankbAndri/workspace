package com.example.cmmsApplication.maintenancerequest.service;

import com.example.cmmsApplication.equipment.entity.Equipment;
import com.example.cmmsApplication.equipment.service.EquipmentChecklistService;
import com.example.cmmsApplication.maintenancerequest.dao.RequestChecklistItemDAO;
import com.example.cmmsApplication.maintenancerequest.dto.RequestChecklistItemDTO;
import com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest;
import com.example.cmmsApplication.maintenancerequest.entity.RequestChecklistItem;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestChecklistServiceTest {
    @Mock private RequestChecklistItemDAO dao;
    @Mock private EquipmentChecklistService equipmentService;
    private RequestChecklistService service;
    private MaintenanceRequest request;
    private RequestChecklistItem existing;

    @BeforeEach void setup() {
        service = new RequestChecklistService(dao, equipmentService);
        Equipment equipment = new Equipment(); equipment.setId(2L);
        request = new MaintenanceRequest(); request.setId(3L); request.setEquipment(equipment);
        existing = new RequestChecklistItem(); existing.setId(4L); existing.setRequest(request);
        existing.setTaskTitle("Original"); existing.setActive(true); existing.setSourceEquipmentChecklistItemId(8L);
        existing.setSourceChecklistName("Original group");
        when(dao.findByOwnerId(3L)).thenReturn(List.of(existing));
    }

    @Test void omissionPreservesStepsAndValidatesEquipment() {
        service.saveChecklistItems(request, null);
        assertTrue(existing.getActive());
        verify(dao, never()).save(any());
        verify(equipmentService).validateSource(2L, 8L, true);
    }

    @Test void clearingRetiresRowsWithoutDeletingSourceHistory() {
        service.saveChecklistItems(request, List.of());
        assertFalse(existing.getActive());
        assertEquals(4L, existing.getId());
        assertEquals("Original", existing.getTaskTitle());
        verify(dao).save(existing);
    }

    @Test void customizationKeepsIdAndOriginalSourceName() {
        var dto = RequestChecklistItemDTO.builder().id(4L).sourceEquipmentChecklistItemId(8L).sourceChecklistName("Tampered").taskTitle("Custom").build();
        service.saveChecklistItems(request, List.of(dto));
        assertEquals(4L, existing.getId());
        assertEquals("Custom", existing.getTaskTitle());
        assertEquals("Original group", existing.getSourceChecklistName());
        assertTrue(existing.getActive());
        verify(equipmentService).validateSource(2L, 8L, true);
    }

    @Test void rejectsAnotherRequestsRow() {
        assertThrows(InvalidOperationException.class, () -> service.saveChecklistItems(request,
            List.of(RequestChecklistItemDTO.builder().id(99L).taskTitle("Invalid").build())));
    }

    @Test void rejectsDuplicateEquipmentSteps() {
        var dto = RequestChecklistItemDTO.builder().sourceEquipmentChecklistItemId(8L).taskTitle("Check").build();
        assertThrows(InvalidOperationException.class, () -> service.saveChecklistItems(request, List.of(dto, dto)));
    }
}
