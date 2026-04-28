package com.example.travelreimbursement.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Travel Reimbursement System API")
                .version("1.0.0")
                .description("API documentation for Employee Travel Reimbursement System. " +
                    "This API manages employee travel claims, approvals, and reimbursements. " +
                    "Default credentials: username=alice, password=andritz")
                .contact(new Contact()
                    .name("Travel Reimbursement System")
                    .email("support@travelreimbursement.com")
                    .url("https://travelreimbursement.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8080/api")
                    .description("Development Server"),
                new Server()
                    .url("https://api.travelreimbursement.com")
                    .description("Production Server")
            ))
            .addSecurityItem(new SecurityRequirement().addList("bearer_jwt"))
            .components(new Components()
                .addSecuritySchemes("bearer_jwt", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT token from /auth/login endpoint")));
    }
}

