package com.example.cmmsApplication.spareparts.service;

import com.example.cmmsApplication.spareparts.dto.SparePartReorderDTO;
import com.example.cmmsApplication.spareparts.dto.SparePartTransactionDTO;
import java.util.List;

/** Service contract for spare part reorder. */
public interface SparePartReorderService {
    SparePartReorderDTO create(SparePartReorderDTO dto);

    SparePartReorderDTO update(Long id, SparePartReorderDTO dto);

    List<SparePartReorderDTO> getAll(Long siteId, String status);

    SparePartReorderDTO receiveStock(Long id, SparePartTransactionDTO dto);
}
