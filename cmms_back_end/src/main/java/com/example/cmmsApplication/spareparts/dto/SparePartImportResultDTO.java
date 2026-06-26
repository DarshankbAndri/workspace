package com.example.cmmsApplication.spareparts.dto;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartImportResultDTO {
    private int created;
    private int updated;
    private int failed;
    private List<String> errors = new ArrayList<>();

public void incrementCreated() { created++; }
    public void incrementUpdated() { updated++; }
    public void addError(String error) {
        failed++;
        errors.add(error);
    }
}
