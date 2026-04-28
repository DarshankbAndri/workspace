# Project Structure

## Complete File Listing

### Root Files
```
travel-reimbursement-system/
├── pom.xml                          # Maven configuration with all dependencies
├── .gitignore                        # Git ignore file
├── README.md                         # Comprehensive project documentation
├── QUICKSTART.md                     # Quick start guide for setup
└── API_DOCUMENTATION.md              # Detailed API reference
```

### Source Code (src/main/java)
```
src/main/java/com/example/travelreimbursement/
│
├── TravelReimbursementSystemApplication.java
│   └── Main Spring Boot application entry point
│
├── entity/
│   ├── User.java                    # User entity with manager relationship
│   ├── UserRole.java                # Enum: EMPLOYEE, MANAGER, HR, ADMIN
│   ├── Claim.java                   # Claim entity for reimbursement claims
│   ├── ClaimStatus.java             # Enum: DRAFT, SUBMITTED, PENDING_MANAGER_APPROVAL, etc.
│   ├── Approval.java                # Approval entity for tracking approvals
│   └── ApprovalStatus.java          # Enum: PENDING, APPROVED, REJECTED
│
├── dto/
│   ├── UserDTO.java                 # Data Transfer Object for User
│   ├── ClaimDTO.java                # Data Transfer Object for Claim
│   ├── ApprovalDTO.java             # Data Transfer Object for Approval
│   └── ApprovalRequestDTO.java      # Request DTO for approval operations
│
├── repository/
│   ├── UserRepository.java          # Spring Data JPA repository for User
│   ├── ClaimRepository.java         # Spring Data JPA repository for Claim
│   └── ApprovalRepository.java      # Spring Data JPA repository for Approval
│
├── service/
│   ├── UserService.java             # Business logic for user operations
│   └── ClaimService.java            # Business logic for claim operations
│
├── controller/
│   ├── UserController.java          # REST controller for user endpoints
│   └── ClaimController.java         # REST controller for claim endpoints
│
├── exception/
│   ├── ResourceNotFoundException.java    # Exception for missing resources
│   ├── UnauthorizedAccessException.java  # Exception for unauthorized access
│   ├── InvalidOperationException.java    # Exception for invalid operations
│   ├── ErrorResponse.java               # Standard error response DTO
│   └── GlobalExceptionHandler.java      # Centralized exception handler
│
└── config/
    └── SecurityConfig.java          # Spring Security configuration
```

### Resources (src/main/resources)
```
src/main/resources/
├── application.properties            # Spring Boot configuration
└── data.sql                         # Sample data for testing
```

### Tests (src/test/java)
```
src/test/java/com/example/travelreimbursement/
├── entity/
│   └── ClaimTest.java               # Unit tests for Claim entity
└── service/
    └── UserServiceTest.java         # Unit tests for UserService
```

---

## Entity Relationships

```
User (1) ──manager──→ User (0..1)
  ↓
  └─── claims (1..*)
       ↓
       Claim
         ├─→ User (user) [1..1]
         ├─→ User (manager) [0..1]
         └─→ Approvals (1..*)
             ├─→ User (approver) [1..1]
             └─→ ApprovalStatus [1..1]
```

---

## Key Features

### User Management
- ✅ Create users with roles (EMPLOYEE, MANAGER, HR, ADMIN)
- ✅ Self-referencing manager relationship
- ✅ User profile management
- ✅ Department tracking

### Claim Management
- ✅ Create draft claims
- ✅ Submit for manager approval
- ✅ Manager approval/rejection workflow
- ✅ HR final approval
- ✅ Mark as paid
- ✅ Rejection reason tracking
- ✅ Timestamp tracking (created, submitted, approved, paid)

### Approval Workflow
- ✅ Manager-level approval
- ✅ HR-level approval
- ✅ Comments/feedback on approvals
- ✅ Approval history tracking

### API Features
- ✅ RESTful endpoints (CRUD operations)
- ✅ Input validation with Jakarta Validation
- ✅ Comprehensive error handling
- ✅ Proper HTTP status codes
- ✅ Structured error responses

### Security (Basic Setup)
- ✅ Password encryption (BCrypt)
- ✅ Spring Security framework ready
- ✅ Role-based logic in services
- ⚠️ JWT authentication to be implemented in production

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.1.0 |
| Java Version | 17 |
| Build Tool | Maven |
| Database | PostgreSQL |
| ORM | JPA/Hibernate |
| Security | Spring Security |
| Validation | Jakarta Validation |
| Serialization | Jackson |
| Boilerplate Reduction | Lombok |
| Testing | JUnit 5, Mockito |

---

## Dependencies

### Web & REST
- spring-boot-starter-web
- jackson-databind

### Data Access
- spring-boot-starter-data-jpa
- postgresql

### Security
- spring-boot-starter-security

### Validation
- spring-boot-starter-validation

### Utilities
- lombok (projectlombok)
- spring-boot-devtools

### Testing
- spring-boot-starter-test
- spring-security-test

---

## Endpoints Overview

### User Endpoints
| Method | Path | Function |
|--------|------|----------|
| GET | /users | List all users |
| GET | /users/{id} | Get user details |
| GET | /users/username/{username} | Get user by username |
| POST | /users | Create new user |
| PUT | /users/{id} | Update user |

### Claim Endpoints
| Method | Path | Function |
|--------|------|----------|
| POST | /claims | Create claim (draft) |
| POST | /claims/{id}/submit | Submit for approval |
| GET | /claims/my | Get my claims |
| GET | /claims/{id} | Get claim details |
| GET | /claims/pending | Get pending claims |
| PUT | /claims/{id}/approve | Manager approve |
| PUT | /claims/{id}/reject | Manager reject |
| PUT | /claims/{id}/hr-approve | HR approve |
| PUT | /claims/{id}/pay | Mark as paid |

---

## Database Schema

### users table
- id (Primary Key)
- username (Unique)
- email (Unique)
- first_name
- last_name
- role (Enum)
- department
- manager_id (Foreign Key to users)
- active
- created_at
- updated_at

### claims table
- id (Primary Key)
- user_id (Foreign Key)
- manager_id (Foreign Key, nullable)
- description
- amount (BigDecimal)
- status (Enum)
- rejection_reason (nullable)
- created_at
- submitted_at (nullable)
- approved_at (nullable)
- paid_at (nullable)
- updated_at

### approvals table
- id (Primary Key)
- claim_id (Foreign Key)
- approver_id (Foreign Key)
- role (Enum)
- status (Enum)
- comments (nullable)
- created_at
- approved_at (nullable)

---

## Configuration Properties

Key properties in `application.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_reimbursement
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Logging
logging.level.root=INFO
logging.level.com.example.travelreimbursement=DEBUG
```

---

## Exception Handling

All exceptions are caught by `GlobalExceptionHandler`:

- **ResourceNotFoundException** (404) - Resource not found
- **UnauthorizedAccessException** (403) - Access denied
- **InvalidOperationException** (400) - Invalid operation
- **MethodArgumentNotValidException** (400) - Validation errors
- **Generic Exception** (500) - Unexpected errors

All errors return a consistent JSON response with:
- timestamp
- status code
- error type
- message
- path

---

## Validation Rules

### User
- username: Required, unique, non-blank
- email: Required, unique, valid email
- firstName: Required
- lastName: Required
- role: Required (EMPLOYEE, MANAGER, HR, ADMIN)
- department: Required

### Claim
- description: Required, non-blank
- amount: Required, must be > 0

### Approval Request
- comments: Required, non-blank

---

## Testing

Tests included:
- `ClaimTest.java` - Entity creation tests
- `UserServiceTest.java` - Service layer tests with Mockito

Run tests:
```bash
mvn test
```

---

## Security Considerations

### Current Implementation
- Password encryption with BCrypt
- Basic role-based logic in services
- All endpoints currently permit all (production: add authentication)

### Production Recommendations
1. Implement JWT bearer token authentication
2. Add ROLE-based access control to controller endpoints
3. Enable HTTPS/TLS
4. Implement rate limiting
5. Add comprehensive audit logging
6. Implement request signing
7. Add CORS configuration
8. Use encrypted environment variables for sensitive config

---

## Future Enhancements

- [ ] JWT authentication implementation
- [ ] OAuth2 integration
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Advanced search and filtering
- [ ] Pagination for list endpoints
- [ ] Audit logging
- [ ] Multi-currency support
- [ ] Bulk approval operations
- [ ] Mobile app API
- [ ] File upload for receipts storage
- [ ] Analytics dashboard
- [ ] Budget tracking by department

---

## File Size Summary

- Total Java files: 20+
- Total configuration files: 4
- Documentation files: 4
- Test files: 2
- Total lines of code: ~2000+

---

## How to Build & Deploy

1. **Build**: `mvn clean package`
2. **Run**: `mvn spring-boot:run` or `java -jar target/*.jar`
3. **Docker**: Build Dockerfile for containerization
4. **Production**: Deploy as WAR to application server or Container Registry

---

## Support & Documentation

- README.md - Complete project documentation
- QUICKSTART.md - Step-by-step setup guide
- API_DOCUMENTATION.md - Detailed API reference
- Inline code comments - Code documentation
