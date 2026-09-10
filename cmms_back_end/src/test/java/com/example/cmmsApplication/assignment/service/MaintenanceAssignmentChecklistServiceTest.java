package com.example.cmmsApplication.assignment.service;

import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentChecklistDAO;
import com.example.cmmsApplication.assignment.dao.MaintenanceAssignmentDAO;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignment;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistItem;
import com.example.cmmsApplication.common.config.FileStorageConfig;
import com.example.cmmsApplication.common.config.MaintenanceChecklistProperties;
import com.example.cmmsApplication.common.exception.InvalidOperationException;
import com.example.cmmsApplication.common.security.service.AccessControlService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaintenanceAssignmentChecklistServiceTest {
    @Mock
    private MaintenanceAssignmentChecklistDAO checklistDAO;
    @Mock
    private MaintenanceAssignmentDAO assignmentDAO;
    @Mock
    private AccessControlService accessControlService;
    @Mock
    private FileStorageConfig fileStorageConfig;

    @Mock
    private com.example.cmmsApplication.maintenancerequest.dao.RequestChecklistItemDAO requestChecklistDAO;

    private MaintenanceChecklistProperties properties;
    private MaintenanceAssignmentChecklistService service;
    private MaintenanceAssignment assignment;

    @BeforeEach
    void setUp() {
        properties = new MaintenanceChecklistProperties();
        service = new MaintenanceAssignmentChecklistService(
                requestChecklistDAO,
                checklistDAO,
                assignmentDAO,
                accessControlService,
                properties,
                fileStorageConfig
        );
        assignment = new MaintenanceAssignment();
        assignment.setId(10L);
    }

    @Test
    void validateAssignmentCanCompleteBlocksIncompleteRequiredStep() {
        MaintenanceAssignmentChecklistItem item = item("Inspect oil level", true, false, "PENDING");
        when(checklistDAO.findByAssignmentId(assignment.getId())).thenReturn(List.of(item));

        assertThrows(InvalidOperationException.class, () -> service.validateAssignmentCanComplete(assignment));
    }

    @Test
    void validateAssignmentCanCompleteBlocksMissingRequiredProof() {
        MaintenanceAssignmentChecklistItem item = item("Upload proof/photo", true, true, "COMPLETED");
        item.setId(20L);
        when(checklistDAO.findByAssignmentId(assignment.getId())).thenReturn(List.of(item));
        when(checklistDAO.countProofsByItemId(item.getId())).thenReturn(0L);

        assertThrows(InvalidOperationException.class, () -> service.validateAssignmentCanComplete(assignment));
    }

    @Test
    void validateAssignmentCanCompleteAllowsCompletedRequiredStepWithProof() {
        MaintenanceAssignmentChecklistItem item = item("Upload proof/photo", true, true, "COMPLETED");
        item.setId(20L);
        when(checklistDAO.findByAssignmentId(assignment.getId())).thenReturn(List.of(item));
        when(checklistDAO.countProofsByItemId(item.getId())).thenReturn(1L);

        assertDoesNotThrow(() -> service.validateAssignmentCanComplete(assignment));
    }

    @Test
    void validateAssignmentCanCompleteAllowsIncompleteStepWhenEnforcementDisabled() {
        properties.setRequireRequiredStepsBeforeCompletion(false);

        assertDoesNotThrow(() -> service.validateAssignmentCanComplete(assignment));
    }

    @Test
    void requestCopyIsIndependentAndIdempotent() {
        var request = new com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest();
        request.setId(30L);
        assignment.setRequest(request);
        var template = new com.example.cmmsApplication.maintenancerequest.entity.RequestChecklistItem();
        template.setId(40L); template.setTaskTitle("Inspect"); template.setSequenceNumber(1);
        template.setRequired(true); template.setProofRequired(true); template.setActive(true);
        when(requestChecklistDAO.findByOwnerId(30L)).thenReturn(List.of(template));
        var copied = new java.util.ArrayList<MaintenanceAssignmentChecklistItem>();
        when(checklistDAO.findByAssignmentId(10L)).thenAnswer(invocation -> copied);
        org.mockito.Mockito.doAnswer(invocation -> { copied.add(invocation.getArgument(0)); return invocation.getArgument(0); })
                .when(checklistDAO).saveItem(org.mockito.ArgumentMatchers.any());
        service.copyFromRequest(assignment);
        copied.get(0).setStatus("COMPLETED");
        copied.get(0).setResponseValue("Done");
        template.setTaskTitle("Changed later");
        service.copyFromRequest(assignment);
        org.junit.jupiter.api.Assertions.assertEquals(1, copied.size());
        org.junit.jupiter.api.Assertions.assertEquals("Inspect", copied.get(0).getTaskTitle());
        org.junit.jupiter.api.Assertions.assertEquals("COMPLETED", copied.get(0).getStatus());
        org.junit.jupiter.api.Assertions.assertEquals("Done", copied.get(0).getResponseValue());
        org.junit.jupiter.api.Assertions.assertSame(template, copied.get(0).getSourceRequestChecklistItem());
        org.junit.jupiter.api.Assertions.assertTrue(copied.get(0).getProofRequired());
    }

    @Test
    void sourceLinkedStepsCannotBeDeleted() {
        var request = new com.example.cmmsApplication.maintenancerequest.entity.MaintenanceRequest();
        assignment.setRequest(request);
        var copied = item("Inspect", true, false, "PENDING"); copied.setId(9L);
        copied.setSourceRequestChecklistItem(new com.example.cmmsApplication.maintenancerequest.entity.RequestChecklistItem());
        when(assignmentDAO.findById(10L)).thenReturn(java.util.Optional.of(assignment));
        when(checklistDAO.findItemById(9L)).thenReturn(java.util.Optional.of(copied));
        assertThrows(InvalidOperationException.class, () -> service.deleteItem(10L, 9L));
        org.mockito.Mockito.verify(checklistDAO, org.mockito.Mockito.never()).deleteItem(org.mockito.ArgumentMatchers.any());
    }

    private MaintenanceAssignmentChecklistItem item(String title, boolean required, boolean proofRequired, String status) {
        MaintenanceAssignmentChecklistItem item = new MaintenanceAssignmentChecklistItem();
        item.setAssignment(assignment);
        item.setTaskTitle(title);
        item.setRequired(required);
        item.setProofRequired(proofRequired);
        item.setStatus(status);
        return item;
    }
}
