package com.example.cmmsApplication.equipment.dto;
import java.util.List;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentChecklistDTO {
    private Long id;
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Size(max = 200)
    private String name;
    @jakarta.validation.Valid
    private List<EquipmentChecklistItemDTO> items;
}
