package com.example.cmmsApplication.maintenancerequest.dao;
import com.example.cmmsApplication.maintenancerequest.entity.RequestChecklistItem;
import com.example.cmmsApplication.maintenancerequest.repository.RequestChecklistItemRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
@Component
@RequiredArgsConstructor
public class RequestChecklistItemDAO {
    private final RequestChecklistItemRepository repository;
    public List<RequestChecklistItem> findByOwnerId(Long id) { return repository.findByRequestIdOrderBySequenceNumberAscIdAsc(id); }
    public RequestChecklistItem save(RequestChecklistItem item) { return repository.save(item); }
    public java.util.Optional<RequestChecklistItem> findById(Long id) { return repository.findById(id); }
}
