package com.example.cmmsApplication.equipment.dto;
import java.util.List;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentChecklistsDTO {
    @jakarta.validation.Valid
    private List<EquipmentChecklistDTO> groups;
    @jakarta.validation.Valid
    private List<EquipmentChecklistItemDTO> standaloneItems;
}
