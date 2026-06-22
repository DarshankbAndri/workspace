package com.example.cmmsApplication.spareparts.dto;

import java.util.ArrayList;
import java.util.List;

public class SparePartImportResultDTO {
    private int created;
    private int updated;
    private int failed;
    private List<String> errors = new ArrayList<>();

    public int getCreated() { return created; }
    public void setCreated(int created) { this.created = created; }
    public int getUpdated() { return updated; }
    public void setUpdated(int updated) { this.updated = updated; }
    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    public void incrementCreated() { created++; }
    public void incrementUpdated() { updated++; }
    public void addError(String error) {
        failed++;
        errors.add(error);
    }
}




