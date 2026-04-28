package com.example.travelreimbursement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
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
                    "This API manages employee travel claims, approvals, and reimbursements.")
                .contact(new Contact()
                    .name("Travel Reimbursement System")
                    .email("support@travelreimbursement.com")
                    .url("https://travelreimbursement.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8080")
                    .description("Development Server"),
                new Server()
                    .url("https://api.travelreimbursement.com")
                    .description("Production Server")
            ));
    }
}
