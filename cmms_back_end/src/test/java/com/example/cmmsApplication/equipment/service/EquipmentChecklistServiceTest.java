package com.example.cmmsApplication.equipment.service;

import com.example.cmmsApplication.equipment.dao.*;
import com.example.cmmsApplication.equipment.dto.*;
import com.example.cmmsApplication.equipment.entity.*;
import com.example.cmmsApplication.site.entity.Site;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipmentChecklistServiceTest {
    @Mock private EquipmentChecklistDAO groups;
    @Mock private EquipmentChecklistItemDAO items;
    @Mock private EquipmentDAO equipmentDAO;
    @Mock private AccessControlService access;
    private EquipmentChecklistService service;
    private Equipment equipment;
    private EquipmentChecklistItem item;

    @BeforeEach void setup() {
        service = new EquipmentChecklistService(groups, items, equipmentDAO, access);
        equipment = new Equipment(); equipment.setId(1L);
        Site site = new Site(); site.setId(2L); equipment.setSite(site);
        item = new EquipmentChecklistItem(); item.setId(3L); item.setEquipment(equipment); item.setActive(true);
    }

    @Test void sourceCannotComeFromAnotherEquipment() {
        when(items.findById(3L)).thenReturn(Optional.of(item));
        assertThrows(InvalidOperationException.class, () -> service.validateSource(99L, 3L, false));
    }

    @Test void retiredSourceRemainsValidOnlyForSavedSnapshots() {
        item.setActive(false);
        when(items.findById(3L)).thenReturn(Optional.of(item));
        assertThrows(InvalidOperationException.class, () -> service.validateSource(1L, 3L, false));
        assertSame(item, service.validateSource(1L, 3L, true));
        verify(access, times(2)).validateSiteAccess(2L);
    }

    @Test void catalogIncludesNamedAndStandaloneStepsAndChecksSiteAccess() {
        var group = new EquipmentChecklist(); group.setId(4L); group.setEquipment(equipment); group.setName("Daily");
        var grouped = new EquipmentChecklistItem(); grouped.setId(5L); grouped.setEquipment(equipment); grouped.setChecklist(group);
        when(equipmentDAO.findById(1L)).thenReturn(Optional.of(equipment));
        when(groups.findByEquipmentId(1L)).thenReturn(List.of(group));
        when(items.findByOwnerId(1L)).thenReturn(List.of(item, grouped));
        var result = service.get(1L);
        assertEquals(1, result.getGroups().size());
        assertEquals(5L, result.getGroups().get(0).getItems().get(0).getId());
        assertEquals(3L, result.getStandaloneItems().get(0).getId());
        verify(access).validateSiteAccess(2L);
    }

    @Test void explicitEmptyCollectionsRetireMasterRows() {
        when(groups.findByEquipmentId(1L)).thenReturn(List.of());
        when(items.findByOwnerId(1L)).thenReturn(List.of(item));
        service.save(equipment, EquipmentChecklistsDTO.builder().groups(List.of()).standaloneItems(List.of()).build());
        assertFalse(item.getActive());
        verify(items).save(item);
    }
}
