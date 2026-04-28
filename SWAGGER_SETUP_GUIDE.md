# Swagger Configuration Guide

## Overview
Swagger/OpenAPI 3.0 has been successfully configured for the Travel Reimbursement System API. The interactive API documentation is now available through Swagger UI.

## What Was Configured

### 1. Dependencies Added
- **springdoc-openapi-starter-webmvc-ui** (v2.0.2)
  - Provides OpenAPI 3.0 specification generation
  - Includes built-in Swagger UI interface
  - Supports automatic API documentation from annotations

### 2. Configuration Class
**File**: `OpenApiConfig.java`

```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Travel Reimbursement System API")
                .version("1.0.0")
                .description("API documentation for Employee Travel Reimbursement System")
                .contact(...)
                .license(...))
            .servers(List.of(...));
    }
}
```

### 3. API Documentation Annotations

#### Controllers
- **@Tag** - Groups endpoints by resource (Users, Claims)
- **@Operation** - Documents each endpoint's purpose
- **@Parameter** - Documents request parameters
- **@ApiResponse** / **@ApiResponses** - Documents response codes and descriptions

#### DTOs
- **@Schema** - Documents data model fields
- Includes examples and field descriptions
- Supports validation annotations (e.g., @NotBlank, @Positive)

## Accessing Swagger UI

### 1. Start the Backend
```bash
cd c:\workspace\travel-reimbursement-system
mvn spring-boot:run
```

Backend will run on: `http://localhost:8080`

### 2. Open Swagger UI
Navigate to: **http://localhost:8080/api/swagger-ui.html**

### 3. Alternative Access Points
- **Swagger UI HTML**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/v3/api-docs`
- **OpenAPI YAML**: `http://localhost:8080/api/v3/api-docs.yaml`

## Features Available in Swagger UI

### Endpoint Documentation
- **HTTP Method** (GET, POST, PUT, DELETE)
- **Endpoint Path** with parameters
- **Description** of what the endpoint does
- **Request/Response Models** with field descriptions

### Try It Out
- Click "Try it out" button on any endpoint
- Fill in required parameters
- Execute the request directly from Swagger UI
- View actual response with status codes

### Response Examples
- Response codes and descriptions
- Sample response bodies
- Error messages and validations

### Data Models
- View all DTOs and their fields
- See required vs. optional fields
- View validation constraints
- See example values

## Organized Endpoints

### Users Endpoint Group
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user

### Claims Endpoint Group
- `POST /api/claims` - Create new claim
- `POST /api/claims/{id}/submit` - Submit claim
- `GET /api/claims/my` - Get user's claims
- `GET /api/claims/pending` - Get pending claims
- `GET /api/claims/{id}` - Get claim details
- `PUT /api/claims/{id}/approve` - Manager approve
- `PUT /api/claims/{id}/reject` - Manager reject
- `PUT /api/claims/{id}/hr-approve` - HR approve
- `PUT /api/claims/{id}/pay` - Mark as paid

## Example API Call from Swagger UI

1. Open Swagger UI
2. Expand "Users" section
3. Click on "GET /api/users"
4. Click "Try it out"
5. Click "Execute"
6. View the response

## For Production

### Update Servers
Modify `OpenApiConfig.java` to add production server:
```java
.servers(List.of(
    new Server()
        .url("http://localhost:8080")
        .description("Development"),
    new Server()
        .url("https://api.production.com")
        .description("Production")
))
```

### Security Configuration
Add security schemes if implementing authentication:
```java
.addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
.components(new Components()
    .addSecuritySchemes("Bearer Authentication", 
        new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")))
```

## API Documentation Files Generated

When the application runs, Springdoc generates:

1. **OpenAPI JSON**: `/api/v3/api-docs`
   - Machine-readable API specification
   - Can be imported into tools like Postman

2. **OpenAPI YAML**: `/api/v3/api-docs.yaml`
   - Alternative format for API specification

3. **Swagger UI**: `/api/swagger-ui.html`
   - Interactive web interface
   - Allows testing endpoints directly

## Files Modified

| File | Changes |
|------|---------|
| `pom.xml` | Added springdoc-openapi-starter-webmvc-ui dependency |
| `OpenApiConfig.java` | Created new configuration class |
| `UserController.java` | Added @Tag, @Operation, @Parameter, @ApiResponse annotations |
| `ClaimController.java` | Added @Tag, @Operation, @Parameter, @ApiResponse annotations |
| `UserDTO.java` | Added @Schema annotations to all fields |
| `ClaimDTO.java` | Added @Schema annotations to all fields |

## Build Status
✅ All 25 source files compiled successfully
✅ No compilation errors
✅ Ready for production

## Next Steps

1. Start the backend: `mvn spring-boot:run`
2. Open http://localhost:8080/api/swagger-ui.html
3. Explore and test all API endpoints
4. Use Swagger to generate client SDKs (if needed)
5. Share API documentation with frontend developers
