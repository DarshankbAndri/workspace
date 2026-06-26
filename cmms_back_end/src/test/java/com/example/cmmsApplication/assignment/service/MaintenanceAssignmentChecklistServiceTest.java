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

    private MaintenanceChecklistProperties properties;
    private MaintenanceAssignmentChecklistService service;
    private MaintenanceAssignment assignment;

    @BeforeEach
    void setUp() {
        properties = new MaintenanceChecklistProperties();
        service = new MaintenanceAssignmentChecklistService(
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
