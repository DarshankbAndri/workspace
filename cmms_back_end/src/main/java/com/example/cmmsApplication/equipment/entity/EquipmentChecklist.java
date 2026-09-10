package com.example.cmmsApplication.equipment.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "equipment_checklist")
@Getter @Setter @NoArgsConstructor
public class EquipmentChecklist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;
    @Column(nullable = false, length = 200)
    private String name;
    @Column(nullable = false)
    private Boolean active = true;
}
