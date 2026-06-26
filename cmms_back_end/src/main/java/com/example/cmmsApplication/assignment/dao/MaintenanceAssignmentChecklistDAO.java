package com.example.cmmsApplication.assignment.dao;

import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistItem;
import com.example.cmmsApplication.assignment.entity.MaintenanceAssignmentChecklistProof;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentChecklistItemRepository;
import com.example.cmmsApplication.assignment.repository.MaintenanceAssignmentChecklistProofRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaintenanceAssignmentChecklistDAO {
    private final MaintenanceAssignmentChecklistItemRepository itemRepository;
    private final MaintenanceAssignmentChecklistProofRepository proofRepository;

    public List<MaintenanceAssignmentChecklistItem> findByAssignmentId(Long assignmentId) {
        return itemRepository.findByAssignmentIdOrderBySequenceNumberAscIdAsc(assignmentId);
    }

    public Optional<MaintenanceAssignmentChecklistItem> findItemById(Long id) {
        return itemRepository.findById(id);
    }

    public MaintenanceAssignmentChecklistItem saveItem(MaintenanceAssignmentChecklistItem item) {
        return itemRepository.save(item);
    }

    public void deleteItem(MaintenanceAssignmentChecklistItem item) {
        itemRepository.delete(item);
    }

    public long countItemsByAssignmentId(Long assignmentId) {
        return itemRepository.countByAssignmentId(assignmentId);
    }

    public MaintenanceAssignmentChecklistProof saveProof(MaintenanceAssignmentChecklistProof proof) {
        return proofRepository.save(proof);
    }

    public Optional<MaintenanceAssignmentChecklistProof> findProofById(Long id) {
        return proofRepository.findById(id);
    }

    public List<MaintenanceAssignmentChecklistProof> findProofsByItemId(Long itemId) {
        return proofRepository.findByChecklistItemIdOrderByUploadedAtDesc(itemId);
    }

    public long countProofsByItemId(Long itemId) {
        return proofRepository.countByChecklistItemId(itemId);
    }

    public void deleteProof(MaintenanceAssignmentChecklistProof proof) {
        proofRepository.delete(proof);
    }

    public void deleteProofsByItemId(Long itemId) {
        proofRepository.deleteByChecklistItemId(itemId);
    }
}
