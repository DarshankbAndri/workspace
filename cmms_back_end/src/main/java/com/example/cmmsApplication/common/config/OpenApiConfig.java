package com.example.cmmsApplication.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.BooleanSchema;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class OpenApiConfig {
    private final CmmsOpenApiProperties openApiProperties;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("CMMS API")
                .version("1.0.0")
                .description("""
                        API documentation for the CMMS application. JSON REST endpoints use ApiResponse<T> for successful responses and ApiErrorResponse for errors.
                        Send X-Correlation-Id to trace a request; the same value is returned in the response header and response body.
                        Operational endpoints are available under /actuator/health, /actuator/health/liveness, /actuator/health/readiness, /actuator/metrics, and /actuator/prometheus.
                        Metrics include cmms.api.requests, cmms.api.errors, cmms.auth.login.failures, cmms.notification.job.*, cmms.pm.generation.*, cmms.approval.*.count, and cmms.inventory.*.
                        """)
                .contact(new Contact()
                    .name("CMMS Support")
                    .email("support@cmmsApplication.com")
                    .url("https://cmmsApplication.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
            .servers(List.of(
                new Server()
                    .url(openApiProperties.getServerUrl())
                    .description(openApiProperties.getServerDescription())
            ))
            .addSecurityItem(new SecurityRequirement().addList("bearer_jwt"))
            .components(new Components()
                .addSecuritySchemes("bearer_jwt", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT token from /auth/login endpoint"))
                .addSchemas("ApiResponse", apiResponseSchema())
                .addSchemas("ApiErrorResponse", apiErrorResponseSchema())
                .addSchemas("ApiValidationError", apiValidationErrorSchema()));
    }

    @Bean
    public OperationCustomizer standardApiResponses() {
        return (operation, handlerMethod) -> {
            operation.getResponses().addApiResponse("400", apiError("Bad request or validation failure"));
            operation.getResponses().addApiResponse("401", apiError("Authentication is required or invalid"));
            operation.getResponses().addApiResponse("403", apiError("Access is denied"));
            operation.getResponses().addApiResponse("404", apiError("Resource not found"));
            operation.getResponses().addApiResponse("500", apiError("Internal server error"));
            return operation;
        };
    }

    private Schema<?> apiResponseSchema() {
        return new ObjectSchema()
                .addProperty("timestamp", new StringSchema().format("date-time").example("2026-06-25T10:15:30Z"))
                .addProperty("status", new IntegerSchema().example(200))
                .addProperty("success", new BooleanSchema().example(true))
                .addProperty("code", new StringSchema().example("SUCCESS"))
                .addProperty("message", new StringSchema().example("Operation completed successfully."))
                .addProperty("data", new ObjectSchema())
                .addProperty("path", new StringSchema().example("/api/vendor/search"))
                .addProperty("correlationId", new StringSchema().example("a1b2c3d4"));
    }

    private Schema<?> apiErrorResponseSchema() {
        return new ObjectSchema()
                .addProperty("timestamp", new StringSchema().format("date-time").example("2026-06-25T10:15:30Z"))
                .addProperty("status", new IntegerSchema().example(400))
                .addProperty("success", new BooleanSchema().example(false))
                .addProperty("code", new StringSchema().example("VALIDATION_ERROR"))
                .addProperty("message", new StringSchema().example("Validation failed."))
                .addProperty("details", new ArraySchema().items(new Schema<>().$ref("#/components/schemas/ApiValidationError")))
                .addProperty("path", new StringSchema().example("/api/vendor/create"))
                .addProperty("correlationId", new StringSchema().example("a1b2c3d4"));
    }

    private Schema<?> apiValidationErrorSchema() {
        return new ObjectSchema()
                .addProperty("field", new StringSchema().example("vendorName"))
                .addProperty("message", new StringSchema().example("Vendor name is required"));
    }

    private ApiResponse apiError(String description) {
        return new ApiResponse()
                .description(description)
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE,
                                new io.swagger.v3.oas.models.media.MediaType()
                                        .schema(new Schema<>().$ref("#/components/schemas/ApiErrorResponse"))));
    }
}
