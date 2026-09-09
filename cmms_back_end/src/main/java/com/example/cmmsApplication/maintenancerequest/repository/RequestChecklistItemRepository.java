package com.example.cmmsApplication.maintenancerequest.repository;
import com.example.cmmsApplication.maintenancerequest.entity.RequestChecklistItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RequestChecklistItemRepository extends JpaRepository<RequestChecklistItem, Long> {
    List<RequestChecklistItem> findByRequestIdOrderBySequenceNumberAscIdAsc(Long id);
}
