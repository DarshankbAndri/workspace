package com.example.cmmsApplication.common.config;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "cmms.maintenance.checklist")
@Getter
@Setter
public class MaintenanceChecklistProperties {
    private boolean enabled = true;
    private boolean requireRequiredStepsBeforeCompletion = true;
    private boolean proofUploadsEnabled = true;
    private boolean requireProofWhenStepRequiresProof = true;
    private int maxProofFileSizeMb = 10;
    private List<String> allowedProofContentTypes = List.of("image/png", "image/jpeg", "image/webp", "application/pdf");
}
